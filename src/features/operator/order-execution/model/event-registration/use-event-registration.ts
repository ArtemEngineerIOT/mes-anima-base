import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useOrderExecutionMachineStompSnapshot } from "../machine-stomp/order-execution-machine-stomp-context";
import type { MachineId } from "../types";
import {
    canProceedEventRegistrationStep1,
    canProceedEventRegistrationStep2,
    createEmptyDraft,
    draftToJournalDetails,
    findEventCode,
    getScrapRemovalMode,
} from "./field-rules";
import { getEventRegistrationSnapshot } from "./mock-event-registration";
import {
    buildStep2SensorPrefill,
    mergeStep2SensorPrefill,
    resolveRemoveScrapDefault,
} from "./prefill-event-registration-draft";
import type {
    EventRegistrationDraft,
    EventRegistrationStep,
    ProcessJournalEntry,
    UnprocessedMachineEvent,
} from "./types";

function formatRegisteredAt(): string {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
}

function makeJournalId(): string {
    return `j-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildDraftForActiveSignal(
    snapshot: ReturnType<typeof getEventRegistrationSnapshot>,
    signal: UnprocessedMachineEvent | null,
): EventRegistrationDraft {
    const immediate = resolveRemoveScrapDefault(signal);
    return {
        ...createEmptyDraft(snapshot),
        removeScrapImmediately: immediate,
        roll: immediate ? snapshot.scrapRollDefault : snapshot.activeRollDefault,
    };
}

export function useEventRegistration(machineId: MachineId) {
    const snapshot = useMemo(() => getEventRegistrationSnapshot(machineId), [machineId]);
    const machineSnapshot = useOrderExecutionMachineStompSnapshot();

    const [step, setStep] = useState<EventRegistrationStep>(1);
    const [draft, setDraft] = useState<EventRegistrationDraft>(() => createEmptyDraft(snapshot));
    const [journal, setJournal] = useState<ProcessJournalEntry[]>(() => snapshot.initialJournal);
    const [unprocessed, setUnprocessed] = useState<UnprocessedMachineEvent[]>(() => snapshot.unprocessedEvents);
    const [selectedUnprocessedId, setSelectedUnprocessedId] = useState<string | null>(null);
    const [discardSelectedIds, setDiscardSelectedIds] = useState<string[]>([]);
    const [deleteComment, setDeleteComment] = useState("");

    const lastAppliedSignalIdRef = useRef<string | null>(null);

    useEffect(() => {
        setStep(1);
        setDraft(createEmptyDraft(snapshot));
        setJournal(snapshot.initialJournal);
        setUnprocessed(snapshot.unprocessedEvents);
        setSelectedUnprocessedId(null);
        setDiscardSelectedIds([]);
        setDeleteComment("");
        lastAppliedSignalIdRef.current = null;
    }, [machineId, snapshot]);

    useEffect(() => {
        setSelectedUnprocessedId((current) => {
            if (unprocessed.length === 0) {
                return null;
            }
            if (current && unprocessed.some((event) => event.id === current)) {
                return current;
            }
            return unprocessed[0].id;
        });
    }, [unprocessed]);

    const selectedUnprocessed = useMemo(
        () => unprocessed.find((event) => event.id === selectedUnprocessedId) ?? null,
        [selectedUnprocessedId, unprocessed],
    );

    useEffect(() => {
        const signalKey = selectedUnprocessedId ?? "__on_the_fly__";
        if (lastAppliedSignalIdRef.current === signalKey) {
            return;
        }

        lastAppliedSignalIdRef.current = signalKey;
        setDraft(buildDraftForActiveSignal(snapshot, selectedUnprocessed));
        setStep(1);
    }, [selectedUnprocessed, selectedUnprocessedId, snapshot]);

    const selectedCode = useMemo(
        () => findEventCode(snapshot.eventCodes, draft.eventCode),
        [draft.eventCode, snapshot.eventCodes],
    );

    const scrapMode = useMemo(() => getScrapRemovalMode(draft), [draft]);

    const patchDraft = useCallback((patch: Partial<EventRegistrationDraft>) => {
        setDraft((prev) => ({ ...prev, ...patch }));
    }, []);

    const onEventCodeChange = useCallback(
        (code: number) => {
            patchDraft({
                eventCode: code,
                subCode: "",
            });
        },
        [patchDraft],
    );

    const onRemoveScrapChange = useCallback(
        (immediate: boolean) => {
            patchDraft({
                removeScrapImmediately: immediate,
                roll: immediate ? snapshot.scrapRollDefault : snapshot.activeRollDefault,
                wholeStage: immediate ? draft.wholeStage : false,
            });
        },
        [draft.wholeStage, patchDraft, snapshot.activeRollDefault, snapshot.scrapRollDefault],
    );

    const onWholeStageChange = useCallback(
        (checked: boolean) => {
            patchDraft({
                wholeStage: checked,
                ...(checked
                    ? { meterFrom: "", meterTo: "", timeFrom: "", timeTo: "" }
                    : {}),
            });
        },
        [patchDraft],
    );

    const applyStep2SensorPrefill = useCallback(() => {
        const prefill = buildStep2SensorPrefill({
            signal: selectedUnprocessed,
            sensorFields: machineSnapshot.fields,
        });

        setDraft((prev) => {
            const withSubCode =
                selectedCode?.subCodes && !prev.subCode
                    ? { ...prev, subCode: selectedCode.subCodes[0] }
                    : prev;

            return mergeStep2SensorPrefill(withSubCode, prefill);
        });
    }, [machineSnapshot.fields, selectedCode, selectedUnprocessed]);

    const canProceedStep1 = canProceedEventRegistrationStep1(draft);
    const canProceedStep2 = canProceedEventRegistrationStep2(draft, selectedCode);

    const goToStep = useCallback(
        (target: EventRegistrationStep) => {
            if (target === 2 && step === 1) {
                applyStep2SensorPrefill();
            }
            setStep(target);
        },
        [applyStep2SensorPrefill, step],
    );

    const goNext = useCallback(() => {
        setStep((current) => {
            if (current === 1) {
                applyStep2SensorPrefill();
                return 2;
            }
            if (current < 3) {
                return (current + 1) as EventRegistrationStep;
            }
            return current;
        });
    }, [applyStep2SensorPrefill]);

    const goBack = useCallback(() => {
        setStep((s) => (s > 1 ? ((s - 1) as EventRegistrationStep) : s));
    }, []);

    const resetWizard = useCallback(() => {
        setStep(1);
        setDraft(buildDraftForActiveSignal(snapshot, selectedUnprocessed));
    }, [selectedUnprocessed, snapshot]);

    const registerEvent = useCallback(() => {
        if (!selectedCode || scrapMode == null) return;

        const details = draftToJournalDetails(draft, selectedCode, scrapMode);
        const meterageSummary = draft.wholeStage
            ? "Весь этап"
            : [draft.meterFrom, draft.meterTo].filter(Boolean).join(" — ") || "—";

        const entry: ProcessJournalEntry = {
            id: makeJournalId(),
            registeredAt: formatRegisteredAt(),
            eventCode: selectedCode.code,
            eventCodeLabel: `${selectedCode.code} — ${selectedCode.label}`,
            subCode: draft.subCode || undefined,
            removeScrapImmediately: scrapMode === "immediate",
            startSummary: draft.wholeStage ? "Начало этапа" : draft.timeFrom || draft.meterFrom || "—",
            endSummary: draft.wholeStage ? "Конец этапа" : draft.timeTo || draft.meterTo || "—",
            meterageSummary,
            details,
        };

        setJournal((prev) => [entry, ...prev]);

        if (selectedUnprocessedId) {
            setUnprocessed((prev) => prev.filter((e) => e.id !== selectedUnprocessedId));
        }

        resetWizard();
    }, [draft, resetWizard, scrapMode, selectedCode, selectedUnprocessedId]);

    const selectSignalForRegistration = useCallback(
        (event: UnprocessedMachineEvent) => {
            lastAppliedSignalIdRef.current = event.id;
            setSelectedUnprocessedId(event.id);
            setDraft(buildDraftForActiveSignal(snapshot, event));
            setStep(1);
        },
        [snapshot],
    );

    const toggleDiscardSelection = useCallback((id: string) => {
        setDiscardSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        );
    }, []);

    const deleteSelectedSignals = useCallback(() => {
        if (!deleteComment.trim() || discardSelectedIds.length === 0) return;

        setUnprocessed((prev) => prev.filter((event) => !discardSelectedIds.includes(event.id)));
        setDiscardSelectedIds([]);
        setDeleteComment("");
    }, [deleteComment, discardSelectedIds]);

    const canDeleteSelectedSignals = deleteComment.trim().length > 0 && discardSelectedIds.length > 0;

    const unprocessedCount = unprocessed.length;

    return {
        snapshot,
        step,
        draft,
        selectedCode,
        scrapMode,
        journal,
        unprocessed,
        selectedUnprocessed,
        selectedUnprocessedId,
        discardSelectedIds,
        deleteComment,
        unprocessedCount,
        patchDraft,
        onEventCodeChange,
        onRemoveScrapChange,
        onWholeStageChange,
        canProceedStep1,
        canProceedStep2,
        canDeleteSelectedSignals,
        goToStep,
        goNext,
        goBack,
        registerEvent,
        selectSignalForRegistration,
        toggleDiscardSelection,
        deleteSelectedSignals,
        setDeleteComment,
    };
}
