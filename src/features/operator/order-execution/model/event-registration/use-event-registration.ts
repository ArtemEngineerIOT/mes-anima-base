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
import { mapListUnprocessedSignalsPayload } from "./map-list-unprocessed-signals-payload";
import { EMPTY_EVENT_REGISTRATION_SNAPSHOT } from "./empty-event-registration-snapshot";
import { buildStep2PrefillFromSignal, buildStep2SensorPrefill, mergeStep2SensorPrefill } from "./prefill-event-registration-draft";
import { useSyncLoadingOnEnable } from "../use-loading-on-enable";
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
import { useListUnprocessedSignals } from "./use-list-unprocessed-signals";

type UseEventRegistrationOptions = {
    machineId: MachineId;
    workAreaId?: string;
    enabled: boolean;
    journalEnabled: boolean;
    /** После успешной регистрации события — silent-reload мониторинга (summary + roll tables) */
    onMonitoringSummaryReload?: () => void;
};

const SETUP_RUN_EVENT_CODE = 120;

function buildDraftForActiveSignal(
    snapshot: EventRegistrationSnapshot,
    signal: UnprocessedMachineEvent | null,
): EventRegistrationDraft {
    const signalPrefill = signal ? buildStep2PrefillFromSignal(signal) : {};

    return {
        ...createEmptyDraft(snapshot),
        removeScrapImmediately: false,
        roll: snapshot.activeRollDefault,
        side: snapshot.sideDefault,
        ...signalPrefill,
    };
}

export function useEventRegistration({
    machineId,
    workAreaId,
    enabled,
    journalEnabled,
    onMonitoringSummaryReload,
}: UseEventRegistrationOptions) {
    const onMonitoringSummaryReloadRef = useRef(onMonitoringSummaryReload);
    onMonitoringSummaryReloadRef.current = onMonitoringSummaryReload;

    const machineSnapshot = useOrderExecutionMachineStompSnapshot();
    const { initWizard } = useEventRegistrationInitWizard();
    const { listSignals } = useListUnprocessedSignals();
    const { discardSignals, isDiscardSignalsPending } = useEventRegistrationDiscardSignals();
    const { loadProcessJournal } = useEventRegistrationProcessJournal();
    const { registerEvent: registerProductionEvent, isRegisterEventPending } =
        useEventRegistrationRegisterEvent();

    const [snapshot, setSnapshot] = useState<EventRegistrationSnapshot>(EMPTY_EVENT_REGISTRATION_SNAPSHOT);
    const [wizardSessionId, setWizardSessionId] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(enabled);
    useSyncLoadingOnEnable(enabled, setIsLoading);

    const [step, setStep] = useState<EventRegistrationStep>(1);
    const [draft, setDraft] = useState<EventRegistrationDraft>(() =>
        createEmptyDraft(EMPTY_EVENT_REGISTRATION_SNAPSHOT),
    );
    const [journal, setJournal] = useState<ProcessJournalEntry[]>([]);
    const [totalLengthM, setTotalLengthM] = useState<number | null>(null);
    const [isJournalLoading, setIsJournalLoading] = useState(journalEnabled);
    useSyncLoadingOnEnable(journalEnabled, setIsJournalLoading);
    const [journalLoadError, setJournalLoadError] = useState<string | null>(null);
    const [unprocessed, setUnprocessed] = useState<UnprocessedMachineEvent[]>([]);
    const [selectedUnprocessedId, setSelectedUnprocessedId] = useState<string | null>(null);
    const [deleteComment, setDeleteComment] = useState("");
    const [discardError, setDiscardError] = useState<string | null>(null);
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [registerSuccessMessage, setRegisterSuccessMessage] = useState<string | null>(null);

    const lastAppliedSignalIdRef = useRef<string | null>(null);
    const initWizardRef = useRef(initWizard);
    initWizardRef.current = initWizard;
    const listSignalsRef = useRef(listSignals);
    listSignalsRef.current = listSignals;
    const discardSignalsRef = useRef(discardSignals);
    discardSignalsRef.current = discardSignals;
    const loadProcessJournalRef = useRef(loadProcessJournal);
    loadProcessJournalRef.current = loadProcessJournal;
    const registerProductionEventRef = useRef(registerProductionEvent);
    registerProductionEventRef.current = registerProductionEvent;
    const journalFallbackRef = useRef<ProcessJournalEntry[]>([]);
    const selectedUnprocessedIdRef = useRef(selectedUnprocessedId);
    selectedUnprocessedIdRef.current = selectedUnprocessedId;

    const resetToEmptySnapshot = useCallback(() => {
        setSnapshot(EMPTY_EVENT_REGISTRATION_SNAPSHOT);
        setWizardSessionId(null);
    }, []);

    type LoadUnprocessedTableOptions = {
        silent?: boolean;
        resetSelection?: boolean;
    };

    const loadUnprocessedTable = useCallback(
        async (trimmedWorkAreaId: string, options?: LoadUnprocessedTableOptions) => {
            const silent = options?.silent ?? false;
            const resetSelection = options?.resetSelection ?? !silent;

            try {
                const payload = await listSignalsRef.current(trimmedWorkAreaId);
                const nextUnprocessed = mapListUnprocessedSignalsPayload(payload);
                setUnprocessed(nextUnprocessed);

                if (resetSelection) {
                    setSelectedUnprocessedId(null);
                    lastAppliedSignalIdRef.current = null;
                    return;
                }

                const previousSelectedId = selectedUnprocessedIdRef.current;
                const nextSelectedId =
                    previousSelectedId && nextUnprocessed.some((event) => event.id === previousSelectedId)
                        ? previousSelectedId
                        : null;
                setSelectedUnprocessedId(nextSelectedId);
                if (previousSelectedId && !nextSelectedId) {
                    lastAppliedSignalIdRef.current = null;
                }
            } catch (error) {
                if (!silent) {
                    throw error;
                }
                // Silent: не обнуляем таблицу и выбор оператора при сбое фонового запроса.
            }
        },
        [],
    );

    const load = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            resetToEmptySnapshot();
            setUnprocessed([]);
            setSelectedUnprocessedId(null);
            lastAppliedSignalIdRef.current = null;
            setLoadError("Не удалось определить workAreaId этапа");
            setIsLoading(false);
            return;
        }

        setWizardSessionId(null);
        setLoadError(null);
        setSelectedUnprocessedId(null);
        lastAppliedSignalIdRef.current = null;
        setIsLoading(true);

        try {
            const [initPayload] = await Promise.all([
                initWizardRef.current({ workAreaId: trimmedWorkAreaId }),
                loadUnprocessedTable(trimmedWorkAreaId, { resetSelection: true }),
            ]);
            const mapped = mapEventRegistrationInitWizardPayload(initPayload, EMPTY_EVENT_REGISTRATION_SNAPSHOT);
            setWizardSessionId(mapped.wizardSessionId || null);
            setSnapshot(mapped.snapshot);
        } catch (error) {
            resetToEmptySnapshot();
            setUnprocessed([]);
            setLoadError(
                error instanceof Error ? error.message : "Не удалось загрузить данные регистрации события",
            );
        } finally {
            setIsLoading(false);
        }
    }, [loadUnprocessedTable, resetToEmptySnapshot, workAreaId]);

    /** Silent-reload таблицы по STOMP `machineSignalsSummaryChanged` — выбор строки сохраняется. */
    const reloadUnprocessedSilent = useCallback(() => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            return;
        }

        void loadUnprocessedTable(trimmedWorkAreaId, { silent: true, resetSelection: false });
    }, [loadUnprocessedTable, workAreaId]);

    const loadJournal = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            setJournal(journalFallbackRef.current);
            setTotalLengthM(null);
            setJournalLoadError("Не удалось определить workAreaId этапа");
            setIsJournalLoading(false);
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
        setUnprocessed([]);
        setSelectedUnprocessedId(null);
        lastAppliedSignalIdRef.current = null;
    }, [machineId, resetToEmptySnapshot]);

    useEffect(() => {
        setStep(1);
        setDraft(createEmptyDraft(snapshot));
        setDeleteComment("");
        setDiscardError(null);
        setRegisterError(null);
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
            const isSetupRunCode = code === SETUP_RUN_EVENT_CODE;
            patchDraft({
                eventCode: code,
                setupRuns: [],
                wholeStage: false,
                ...(isSetupRunCode
                    ? {
                          removeScrapImmediately: true,
                          roll: "",
                          side: "",
                      }
                    : {
                          removeScrapImmediately: false,
                          roll: snapshot.activeRollDefault,
                          side: snapshot.sideDefault,
                      }),
            });
        },
        [patchDraft, snapshot.activeRollDefault, snapshot.sideDefault],
    );

    const onRemoveScrapChange = useCallback(
        (immediate: boolean) => {
            patchDraft({
                removeScrapImmediately: immediate,
                wholeStage: false,
                roll: immediate ? "" : snapshot.activeRollDefault,
                side: immediate ? "" : snapshot.sideDefault,
            });
        },
        [patchDraft, snapshot.activeRollDefault, snapshot.sideDefault],
    );

    const onWholeStageChange = useCallback(
        (checked: boolean) => {
            // Не очищаем метраж/время — при снятии чекбокса значения должны сохраниться.
            patchDraft({ wholeStage: checked });
        },
        [patchDraft],
    );

    const applyStep2SensorPrefill = useCallback(() => {
        const prefill = buildStep2SensorPrefill({
            signal: selectedUnprocessed,
            sensorFields: machineSnapshot.fields,
        });

        setDraft((prev) =>
            mergeStep2SensorPrefill(prev, prefill, {
                // При выбранном сигнале подставляем length_* и time_* с бэка
                overwrite: Boolean(selectedUnprocessed),
            }),
        );
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
        if (step === 1) {
            applyStep2SensorPrefill();
            setStep(2);
            return;
        }
        if (step < 3) {
            setStep((current) => (current + 1) as EventRegistrationStep);
        }
    }, [applyStep2SensorPrefill, isWizardDisabled, step]);

    const goBack = useCallback(() => {
        if (isWizardDisabled) {
            return;
        }
        setStep((s) => (s > 1 ? ((s - 1) as EventRegistrationStep) : s));
    }, [isWizardDisabled]);

    const registerEvent = useCallback(async () => {
        if (!selectedCode || scrapMode == null || isWizardDisabled) return;

        setRegisterError(null);
        setRegisterSuccessMessage(null);

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
            }

            // Один согласованный сброс: без повторного setStep/setDraft из effect по selectedUnprocessedId.
            lastAppliedSignalIdRef.current = "__on_the_fly__";
            setSelectedUnprocessedId(null);
            setStep(1);
            setDraft(buildDraftForActiveSignal(snapshot, null));
            setRegisterError(null);
            setRegisterSuccessMessage(
                mapped.registrationStatusLabel?.trim() || "Событие зарегистрировано",
            );

            if (mapped.processJournalRefreshHint) {
                void loadJournal();
            }

            onMonitoringSummaryReloadRef.current?.();
        } catch (error) {
            setRegisterError(
                error instanceof Error ? error.message : "Не удалось зарегистрировать событие",
            );
        }
    }, [
        draft,
        isWizardDisabled,
        loadJournal,
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

    const dismissRegisterError = useCallback(() => {
        setRegisterError(null);
    }, []);

    const dismissRegisterSuccess = useCallback(() => {
        setRegisterSuccessMessage(null);
    }, []);

    const dismissDiscardError = useCallback(() => {
        setDiscardError(null);
    }, []);

    const unprocessedCount = unprocessed.length;

    return {
        snapshot,
        wizardSessionId,
        loadError,
        isLoading,
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
        dismissDiscardError,
        registerError,
        dismissRegisterError,
        registerSuccessMessage,
        dismissRegisterSuccess,
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
        reloadUnprocessedSilent,
    };
}
