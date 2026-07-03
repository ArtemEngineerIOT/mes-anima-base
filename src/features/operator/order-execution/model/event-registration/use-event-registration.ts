import { useCallback, useEffect, useMemo, useState } from "react";

import type { MachineId } from "../types";
import {
    createEmptyDraft,
    draftToJournalDetails,
    findEventCode,
    getScrapRemovalMode,
} from "./field-rules";
import { getEventRegistrationSnapshot } from "./mock-event-registration";
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

export function useEventRegistration(machineId: MachineId) {
    const snapshot = useMemo(() => getEventRegistrationSnapshot(machineId), [machineId]);

    const [step, setStep] = useState<EventRegistrationStep>(1);
    const [draft, setDraft] = useState<EventRegistrationDraft>(() => createEmptyDraft(snapshot));
    const [journal, setJournal] = useState<ProcessJournalEntry[]>(() => snapshot.initialJournal);
    const [unprocessed, setUnprocessed] = useState<UnprocessedMachineEvent[]>(() => snapshot.unprocessedEvents);
    const [selectedUnprocessedId, setSelectedUnprocessedId] = useState<string | null>(null);
    const [deleteComment, setDeleteComment] = useState("");

    useEffect(() => {
        setStep(1);
        setDraft(createEmptyDraft(snapshot));
        setJournal(snapshot.initialJournal);
        setUnprocessed(snapshot.unprocessedEvents);
        setSelectedUnprocessedId(null);
        setDeleteComment("");
    }, [machineId, snapshot]);

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
            const def = findEventCode(snapshot.eventCodes, code);
            patchDraft({
                eventCode: code,
                subCode: def?.subCodes?.[0] ?? "",
            });
        },
        [patchDraft, snapshot.eventCodes],
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

    const canProceedStep1 = draft.eventCode != null && draft.removeScrapImmediately != null;

    const goToStep = useCallback((target: EventRegistrationStep) => {
        setStep(target);
    }, []);

    const goNext = useCallback(() => {
        setStep((s) => (s < 3 ? ((s + 1) as EventRegistrationStep) : s));
    }, []);

    const goBack = useCallback(() => {
        setStep((s) => (s > 1 ? ((s - 1) as EventRegistrationStep) : s));
    }, []);

    const resetWizard = useCallback(() => {
        setStep(1);
        setDraft(createEmptyDraft(snapshot));
        setSelectedUnprocessedId(null);
        setDeleteComment("");
    }, [snapshot]);

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

    const selectUnprocessed = useCallback(
        (event: UnprocessedMachineEvent) => {
            setSelectedUnprocessedId(event.id);
            patchDraft({
                removeScrapImmediately: event.signalType === "stop",
            });
        },
        [patchDraft],
    );

    const deleteUnprocessed = useCallback(
        (id: string) => {
            if (!deleteComment.trim()) return;
            setUnprocessed((prev) => prev.filter((e) => e.id !== id));
            if (selectedUnprocessedId === id) {
                setSelectedUnprocessedId(null);
            }
            setDeleteComment("");
        },
        [deleteComment, selectedUnprocessedId],
    );

    const unprocessedCount = unprocessed.length;

    return {
        snapshot,
        step,
        draft,
        selectedCode,
        scrapMode,
        journal,
        unprocessed,
        selectedUnprocessedId,
        deleteComment,
        unprocessedCount,
        patchDraft,
        onEventCodeChange,
        onRemoveScrapChange,
        onWholeStageChange,
        canProceedStep1,
        goToStep,
        goNext,
        goBack,
        registerEvent,
        selectUnprocessed,
        deleteUnprocessed,
        setDeleteComment,
        setSelectedUnprocessedId,
    };
}
