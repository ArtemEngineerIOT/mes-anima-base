import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useOrderExecutionMachineStompSnapshot } from "../machine-stomp/order-execution-machine-stomp-context";
import type { MachineId } from "../types";
import {
    canProceedEventRegistrationStep1,
    canProceedEventRegistrationStep2,
    createEmptyDraft,
    findEventCode,
    getScrapRemovalMode,
} from "./field-rules";
import { mapEventRegistrationDiscardSignalsPayload } from "./map-event-registration-discard-signals-payload";
import { mapEventRegistrationInitWizardPayload } from "./map-event-registration-init-wizard-payload";
import { mapEventRegistrationProcessJournalPayload } from "./map-event-registration-process-journal-payload";
import { mapEventRegistrationRegisterEventPayload } from "./map-event-registration-register-event-payload";
import { EMPTY_EVENT_REGISTRATION_SNAPSHOT } from "./empty-event-registration-snapshot";
import {
    buildStep2SensorPrefill,
    mergeStep2SensorPrefill,
    resolveRemoveScrapDefault,
} from "./prefill-event-registration-draft";
import type {
    EventRegistrationDraft,
    EventRegistrationSnapshot,
    EventRegistrationStep,
    ProcessJournalEntry,
    UnprocessedMachineEvent,
} from "./types";
import { useEventRegistrationDiscardSignals } from "./use-event-registration-discard-signals";
import { useEventRegistrationInitWizard } from "./use-event-registration-init-wizard";
import { useEventRegistrationProcessJournal } from "./use-event-registration-process-journal";
import { useEventRegistrationRegisterEvent } from "./use-event-registration-register-event";

type UseEventRegistrationOptions = {
    machineId: MachineId;
    workAreaId?: string;
    enabled: boolean;
    journalEnabled: boolean;
};

function buildDraftForActiveSignal(
    snapshot: EventRegistrationSnapshot,
    signal: UnprocessedMachineEvent | null,
): EventRegistrationDraft {
    const immediate = resolveRemoveScrapDefault(signal);
    return {
        ...createEmptyDraft(snapshot),
        removeScrapImmediately: immediate,
        roll: immediate ? snapshot.scrapRollDefault : snapshot.activeRollDefault,
        side: immediate ? "" : snapshot.sideDefault,
    };
}

export function useEventRegistration({
    machineId,
    workAreaId,
    enabled,
    journalEnabled,
}: UseEventRegistrationOptions) {
    const machineSnapshot = useOrderExecutionMachineStompSnapshot();
    const { initWizard } = useEventRegistrationInitWizard();
    const { discardSignals, isDiscardSignalsPending } = useEventRegistrationDiscardSignals();
    const { loadProcessJournal } = useEventRegistrationProcessJournal();
    const { registerEvent: registerProductionEvent, isRegisterEventPending } =
        useEventRegistrationRegisterEvent();

    const [snapshot, setSnapshot] = useState<EventRegistrationSnapshot>(EMPTY_EVENT_REGISTRATION_SNAPSHOT);
    const [wizardSessionId, setWizardSessionId] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [step, setStep] = useState<EventRegistrationStep>(1);
    const [draft, setDraft] = useState<EventRegistrationDraft>(() =>
        createEmptyDraft(EMPTY_EVENT_REGISTRATION_SNAPSHOT),
    );
    const [journal, setJournal] = useState<ProcessJournalEntry[]>([]);
    const [totalLengthM, setTotalLengthM] = useState<number | null>(null);
    const [isJournalLoading, setIsJournalLoading] = useState(false);
    const [journalLoadError, setJournalLoadError] = useState<string | null>(null);
    const [unprocessed, setUnprocessed] = useState<UnprocessedMachineEvent[]>([]);
    const [selectedUnprocessedId, setSelectedUnprocessedId] = useState<string | null>(null);
    const [deleteComment, setDeleteComment] = useState("");
    const [discardError, setDiscardError] = useState<string | null>(null);
    const [registerError, setRegisterError] = useState<string | null>(null);

    const lastAppliedSignalIdRef = useRef<string | null>(null);
    const initWizardRef = useRef(initWizard);
    initWizardRef.current = initWizard;
    const discardSignalsRef = useRef(discardSignals);
    discardSignalsRef.current = discardSignals;
    const loadProcessJournalRef = useRef(loadProcessJournal);
    loadProcessJournalRef.current = loadProcessJournal;
    const registerProductionEventRef = useRef(registerProductionEvent);
    registerProductionEventRef.current = registerProductionEvent;
    const journalFallbackRef = useRef<ProcessJournalEntry[]>([]);

    const resetToEmptySnapshot = useCallback(() => {
        setSnapshot(EMPTY_EVENT_REGISTRATION_SNAPSHOT);
        setWizardSessionId(null);
    }, []);

    const load = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            resetToEmptySnapshot();
            setLoadError("Не удалось определить workAreaId этапа");
            return;
        }

        setWizardSessionId(null);
        setLoadError(null);

        try {
            const payload = await initWizardRef.current({ workAreaId: trimmedWorkAreaId });
            const mapped = mapEventRegistrationInitWizardPayload(payload, EMPTY_EVENT_REGISTRATION_SNAPSHOT);
            setWizardSessionId(mapped.wizardSessionId || null);
            setSnapshot(mapped.snapshot);
        } catch (error) {
            resetToEmptySnapshot();
            setLoadError(
                error instanceof Error ? error.message : "Не удалось загрузить данные регистрации события",
            );
        }
    }, [resetToEmptySnapshot, workAreaId]);

    const loadJournal = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            setJournal(journalFallbackRef.current);
            setTotalLengthM(null);
            setJournalLoadError("Не удалось определить workAreaId этапа");
            return;
        }

        setIsJournalLoading(true);
        setJournalLoadError(null);

        try {
            const payload = await loadProcessJournalRef.current({ workAreaId: trimmedWorkAreaId });
            const mapped = mapEventRegistrationProcessJournalPayload(payload, journalFallbackRef.current);
            setJournal(mapped.journal);
            setTotalLengthM(mapped.totalLengthM);
        } catch (error) {
            setJournal(journalFallbackRef.current);
            setTotalLengthM(null);
            setJournalLoadError(
                error instanceof Error ? error.message : "Не удалось загрузить журнал процесса",
            );
        } finally {
            setIsJournalLoading(false);
        }
    }, [workAreaId]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        void load();
    }, [enabled, load]);

    useEffect(() => {
        if (!journalEnabled) {
            setIsJournalLoading(false);
            return;
        }

        void loadJournal();
    }, [journalEnabled, loadJournal]);

    useEffect(() => {
        resetToEmptySnapshot();
        setJournal([]);
        setTotalLengthM(null);
        setJournalLoadError(null);
    }, [machineId, resetToEmptySnapshot]);

    useEffect(() => {
        setStep(1);
        setDraft(createEmptyDraft(snapshot));
        setUnprocessed(snapshot.unprocessedEvents);
        setSelectedUnprocessedId(null);
        setDeleteComment("");
        setDiscardError(null);
        setRegisterError(null);
        lastAppliedSignalIdRef.current = null;
    }, [snapshot]);

    useEffect(() => {
        setSelectedUnprocessedId((current) => {
            if (!current) {
                return null;
            }
            return unprocessed.some((event) => event.id === current) ? current : null;
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
                setupRuns: [],
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
                side: immediate ? "" : snapshot.sideDefault,
            });
        },
        [draft.wholeStage, patchDraft, snapshot.activeRollDefault, snapshot.scrapRollDefault, snapshot.sideDefault],
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

        setDraft((prev) => mergeStep2SensorPrefill(prev, prefill));
    }, [machineSnapshot.fields, selectedUnprocessed]);

    const canProceedStep1 = canProceedEventRegistrationStep1(draft);
    const canProceedStep2 = canProceedEventRegistrationStep2(draft, selectedCode);
    const isWizardDisabled = !wizardSessionId || Boolean(loadError) || isRegisterEventPending;

    const goToStep = useCallback(
        (target: EventRegistrationStep) => {
            if (isWizardDisabled) {
                return;
            }
            if (target === 2 && step === 1) {
                applyStep2SensorPrefill();
            }
            setStep(target);
        },
        [applyStep2SensorPrefill, isWizardDisabled, step],
    );

    const goNext = useCallback(() => {
        if (isWizardDisabled) {
            return;
        }
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
    }, [applyStep2SensorPrefill, isWizardDisabled]);

    const goBack = useCallback(() => {
        if (isWizardDisabled) {
            return;
        }
        setStep((s) => (s > 1 ? ((s - 1) as EventRegistrationStep) : s));
    }, [isWizardDisabled]);

    const resetWizard = useCallback(() => {
        setStep(1);
        setDraft(buildDraftForActiveSignal(snapshot, selectedUnprocessed));
    }, [selectedUnprocessed, snapshot]);

    const registerEvent = useCallback(async () => {
        if (!selectedCode || scrapMode == null || isWizardDisabled) return;

        const trimmedWorkAreaId = workAreaId?.trim();
        const trimmedWizardSessionId = wizardSessionId?.trim();
        if (!trimmedWorkAreaId) {
            setRegisterError("Не удалось определить workAreaId этапа");
            return;
        }
        if (!trimmedWizardSessionId) {
            setRegisterError("Не удалось определить сессию мастера регистрации события");
            return;
        }

        setRegisterError(null);

        try {
            const payload = await registerProductionEventRef.current({
                wizardSessionId: trimmedWizardSessionId,
                workAreaId: trimmedWorkAreaId,
                draft,
                scrapMode,
                selectedSignal: selectedUnprocessed,
                snapshot,
            });
            const mapped = mapEventRegistrationRegisterEventPayload(payload);

            if (selectedUnprocessedId) {
                setUnprocessed((prev) => prev.filter((event) => event.id !== selectedUnprocessedId));
                setSelectedUnprocessedId(null);
                lastAppliedSignalIdRef.current = null;
            }

            resetWizard();

            if (mapped.processJournalRefreshHint) {
                void loadJournal();
            }
        } catch (error) {
            setRegisterError(
                error instanceof Error ? error.message : "Не удалось зарегистрировать событие",
            );
        }
    }, [
        draft,
        isWizardDisabled,
        loadJournal,
        resetWizard,
        scrapMode,
        selectedCode,
        selectedUnprocessed,
        selectedUnprocessedId,
        snapshot,
        wizardSessionId,
        workAreaId,
    ]);

    const toggleUnprocessedSelection = useCallback(
        (id: string) => {
            if (isWizardDisabled) {
                return;
            }
            setSelectedUnprocessedId((current) => (current === id ? null : id));
        },
        [isWizardDisabled],
    );

    const deleteSelectedSignals = useCallback(async () => {
        const trimmedComment = deleteComment.trim();
        const signalId = selectedUnprocessedId;
        if (!trimmedComment || !signalId) {
            return;
        }

        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            setDiscardError("Не удалось определить workAreaId этапа");
            return;
        }

        setDiscardError(null);

        try {
            const payload = await discardSignalsRef.current({
                workAreaId: trimmedWorkAreaId,
                signalIds: [signalId],
                comment: trimmedComment,
            });
            mapEventRegistrationDiscardSignalsPayload(payload);
            setSelectedUnprocessedId(null);
            setDeleteComment("");
            lastAppliedSignalIdRef.current = null;
            await load();
        } catch (error) {
            setDiscardError(
                error instanceof Error ? error.message : "Не удалось удалить необработанные сигналы",
            );
        }
    }, [deleteComment, load, selectedUnprocessedId, workAreaId]);

    const canDeleteSelectedSignals =
        deleteComment.trim().length > 0 && Boolean(selectedUnprocessedId) && !isDiscardSignalsPending;
    const isDiscardDisabled = isWizardDisabled || isDiscardSignalsPending;

    const unprocessedCount = unprocessed.length;

    return {
        snapshot,
        wizardSessionId,
        loadError,
        reload: load,
        isWizardDisabled,
        step,
        draft,
        selectedCode,
        scrapMode,
        journal,
        totalLengthM,
        isJournalLoading,
        journalLoadError,
        reloadJournal: loadJournal,
        unprocessed,
        selectedUnprocessed,
        selectedUnprocessedId,
        deleteComment,
        discardError,
        registerError,
        isDiscardSignalsPending,
        isRegisterEventPending,
        isDiscardDisabled,
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
        toggleUnprocessedSelection,
        deleteSelectedSignals,
        setDeleteComment,
    };
}
