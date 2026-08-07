import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { buildReleaseSubmitBlockBody, collectReleaseBlockSeriesRefs } from "./build-release-submit-block-body";
import { mapEventReleaseProductionPayload, getReleaseProductionEventCellValue } from "./map-event-release-production-payload";
import { buildReleaseRegisterBody } from "./build-release-register-body";
import { buildReleasePrintLabelBody } from "./build-release-print-label-body";
import { mapReleaseRegisterPayload } from "./map-release-register-payload";
import { mapPrepareReleaseLabelPayload } from "./map-prepare-release-label-payload";
import { mapReleaseSubmitBlockPayload } from "./map-release-submit-block-payload";
import {
    mapReleaseBatchReleasesPayload,
    RELEASE_EMPTY_BATCH_SNAPSHOT,
    type ReleaseBatchSnapshot,
} from "./map-release-batch-releases-payload";
import { mapReleaseFormInitPayload } from "./map-release-form-init-payload";
import type { ReleaseFormState, ReleaseInitSnapshot } from "./types";
import { RELEASE_EMPTY_INIT, RELEASE_INITIAL_FORM } from "./types";
import {
    RELEASE_EMPTY_PRODUCTION_EVENT,
    type ReleaseProductionEventSnapshot,
} from "./production-event-types";
import { sanitizeReleaseNumericInput } from "./sanitize-release-numeric-input";
import { useReleaseBlockReasons } from "./use-release-block-reasons";

type UseReleaseOptions = {
    workAreaId?: string;
    enabled: boolean;
    /** После успешного registerRelease — silent-reload мониторинга / прогресса */
    onReleaseRegistered?: () => void;
};

type LoadProductionEventOptions = {
    /** Обновить таблицу сигналов без сброса формы и без индикатора загрузки */
    silent?: boolean;
};

/** Сколько держать информер успешного выпуска до начала fade-out */
export const REGISTER_SUBMIT_MESSAGE_VISIBLE_MS = 4000;
/** Длительность плавного исчезновения информера успешного выпуска */
export const REGISTER_SUBMIT_MESSAGE_FADE_MS = 300;

export function useRelease({ workAreaId, enabled, onReleaseRegistered }: UseReleaseOptions) {
    const [form, setForm] = useState<ReleaseFormState>(RELEASE_INITIAL_FORM);
    const [initSnapshot, setInitSnapshot] = useState<ReleaseInitSnapshot>(RELEASE_EMPTY_INIT);
    const [batchSnapshot, setBatchSnapshot] = useState<ReleaseBatchSnapshot>(RELEASE_EMPTY_BATCH_SNAPSHOT);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRegisteringRelease, setIsRegisteringRelease] = useState(false);
    const [registerSubmitError, setRegisterSubmitError] = useState<string | null>(null);
    const [registerSubmitMessage, setRegisterSubmitMessage] = useState<string | null>(null);
    const [registerSubmitMessageKey, setRegisterSubmitMessageKey] = useState(0);
    const [printingReleaseId, setPrintingReleaseId] = useState<string | null>(null);
    const [printError, setPrintError] = useState<string | null>(null);
    const [productionEvent, setProductionEvent] = useState<ReleaseProductionEventSnapshot>(
        RELEASE_EMPTY_PRODUCTION_EVENT,
    );
    const [isProductionEventLoading, setIsProductionEventLoading] = useState(false);
    const [productionEventError, setProductionEventError] = useState<string | null>(null);
    const [selectedProductionEventId, setSelectedProductionEventId] = useState<string | null>(null);
    const [selectedBatchRollIds, setSelectedBatchRollIds] = useState<Set<string>>(() => new Set());
    const [selectedBlockReasonCode, setSelectedBlockReasonCode] = useState<string | null>(null);
    const [blockComment, setBlockComment] = useState("");
    const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);
    const [blockSubmitError, setBlockSubmitError] = useState<string | null>(null);
    const [blockSubmitMessage, setBlockSubmitMessage] = useState<string | null>(null);

    const {
        blockReasons,
        isLoading: isBlockReasonsLoading,
        error: blockReasonsError,
        reload: reloadBlockReasons,
    } = useReleaseBlockReasons({ enabled });

    const { mutateAsync: fetchReleaseProductionEvent } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.eventReleaseProduction,
        {},
    );
    const { mutateAsync: fetchReleaseFormInit } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getReleaseFormInit,
        {},
    );
    const { mutateAsync: fetchBatchReleases } = rqClient.useMutation("post", REST_FUNCTION_PATHS.getBatchReleases, {});
    const { mutateAsync: registerReleaseRequest } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.registerRelease,
        {},
    );
    const { mutateAsync: prepareReleaseLabelRequest } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.prepareReleaseLabel,
        {},
    );
    const { mutateAsync: submitBlockRequest } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.submitBlockRequest,
        {},
    );

    const fetchReleaseProductionEventRef = useRef(fetchReleaseProductionEvent);
    fetchReleaseProductionEventRef.current = fetchReleaseProductionEvent;
    const fetchReleaseFormInitRef = useRef(fetchReleaseFormInit);
    fetchReleaseFormInitRef.current = fetchReleaseFormInit;
    const fetchBatchReleasesRef = useRef(fetchBatchReleases);
    fetchBatchReleasesRef.current = fetchBatchReleases;
    const registerReleaseRequestRef = useRef(registerReleaseRequest);
    registerReleaseRequestRef.current = registerReleaseRequest;
    const prepareReleaseLabelRequestRef = useRef(prepareReleaseLabelRequest);
    prepareReleaseLabelRequestRef.current = prepareReleaseLabelRequest;
    const submitBlockRequestRef = useRef(submitBlockRequest);
    submitBlockRequestRef.current = submitBlockRequest;
    const onReleaseRegisteredRef = useRef(onReleaseRegistered);
    onReleaseRegisteredRef.current = onReleaseRegistered;

    const resetFormState = useCallback(() => {
        setInitSnapshot(RELEASE_EMPTY_INIT);
        setBatchSnapshot(RELEASE_EMPTY_BATCH_SNAPSHOT);
        setForm(RELEASE_INITIAL_FORM);
        setError(null);
    }, []);

    const resetState = useCallback(() => {
        resetFormState();
        setProductionEvent(RELEASE_EMPTY_PRODUCTION_EVENT);
        setProductionEventError(null);
        setSelectedProductionEventId(null);
        setSelectedBatchRollIds(new Set());
        setSelectedBlockReasonCode(null);
        setBlockComment("");
        setBlockSubmitError(null);
        setBlockSubmitMessage(null);
        setRegisterSubmitError(null);
        setRegisterSubmitMessage(null);
    }, [resetFormState]);

    const dismissRegisterSubmitMessage = useCallback(() => {
        setRegisterSubmitMessage(null);
    }, []);

    const selectedProductionEventIdRef = useRef(selectedProductionEventId);
    selectedProductionEventIdRef.current = selectedProductionEventId;

    const clearSignalPrefillFields = useCallback(() => {
        setForm((prev) => ({
            ...prev,
            lengthM: "",
            netWeightKg: "",
            grossWeightKg: "",
            requiresRewind: false,
            isLastRoll: false,
        }));
        setRegisterSubmitError(null);
        setRegisterSubmitMessage(null);
    }, []);

    const loadProductionEvent = useCallback(async (
        trimmedWorkAreaId: string,
        options?: LoadProductionEventOptions,
    ) => {
        const silent = options?.silent ?? false;

        if (!silent) {
            setIsProductionEventLoading(true);
            setProductionEventError(null);
        }

        try {
            const productionEventPayload = await fetchReleaseProductionEventRef.current({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });
            const mapped = mapEventReleaseProductionPayload(productionEventPayload);
            setProductionEvent(mapped);

            if (silent) {
                const previousSelectedId = selectedProductionEventIdRef.current;
                const nextSelectedId =
                    previousSelectedId && mapped.eventList.some((row) => row.id === previousSelectedId)
                        ? previousSelectedId
                        : null;

                setSelectedProductionEventId(nextSelectedId);
                if (previousSelectedId && !nextSelectedId) {
                    clearSignalPrefillFields();
                }
                setProductionEventError(null);
            } else {
                setSelectedProductionEventId(null);
            }
        } catch (loadError) {
            if (!silent) {
                setProductionEvent(RELEASE_EMPTY_PRODUCTION_EVENT);
                setSelectedProductionEventId(null);
                setProductionEventError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Не удалось загрузить событие выпуска с машины",
                );
            }
        } finally {
            if (!silent) {
                setIsProductionEventLoading(false);
            }
        }
    }, [clearSignalPrefillFields]);

    const reloadProductionEventsSilent = useCallback(() => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            return;
        }

        void loadProductionEvent(trimmedWorkAreaId, { silent: true });
    }, [loadProductionEvent, workAreaId]);

    const loadReleaseFormData = useCallback(async (trimmedWorkAreaId: string) => {
        const requestBody = [{ workAreaId: trimmedWorkAreaId }] as const;

        const [initPayload, batchPayload] = await Promise.all([
            fetchReleaseFormInitRef.current({ body: [...requestBody] }),
            fetchBatchReleasesRef.current({ body: [...requestBody] }),
        ]);

        const mappedInit = mapReleaseFormInitPayload(initPayload);
        const mappedBatch = mapReleaseBatchReleasesPayload(batchPayload);

        setInitSnapshot(mappedInit);
        setBatchSnapshot(mappedBatch);
        setSelectedBatchRollIds(new Set());
        setForm({
            ...RELEASE_INITIAL_FORM,
            warehouse: mappedInit.defaultWarehouseCode,
        });
    }, []);

    const load = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            resetState();
            setError("Не удалось определить workAreaId этапа");
            return;
        }

        setIsLoading(true);
        setError(null);

        void loadProductionEvent(trimmedWorkAreaId);

        try {
            await loadReleaseFormData(trimmedWorkAreaId);
        } catch (loadError) {
            resetFormState();
            setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить данные выпуска");
        } finally {
            setIsLoading(false);
        }
    }, [loadProductionEvent, loadReleaseFormData, resetFormState, resetState, workAreaId]);

    useEffect(() => {
        if (!enabled) {
            setIsLoading(false);
            setIsProductionEventLoading(false);
            return;
        }

        void load();
    }, [enabled, load]);

    /** Сворачивание / разворачивание блока — сразу убираем информер успеха */
    useEffect(() => {
        setRegisterSubmitMessage(null);
        setRegisterSubmitError(null);
    }, [enabled]);

    const patchForm = useCallback((patch: Partial<ReleaseFormState>) => {
        const normalizedPatch = { ...patch };
        if ("lengthM" in normalizedPatch && typeof normalizedPatch.lengthM === "string") {
            normalizedPatch.lengthM = sanitizeReleaseNumericInput(normalizedPatch.lengthM);
        }
        if ("netWeightKg" in normalizedPatch && typeof normalizedPatch.netWeightKg === "string") {
            normalizedPatch.netWeightKg = sanitizeReleaseNumericInput(normalizedPatch.netWeightKg);
        }
        if ("grossWeightKg" in normalizedPatch && typeof normalizedPatch.grossWeightKg === "string") {
            normalizedPatch.grossWeightKg = sanitizeReleaseNumericInput(normalizedPatch.grossWeightKg);
        }

        setForm((prev) => ({ ...prev, ...normalizedPatch }));
        setRegisterSubmitError(null);
        setRegisterSubmitMessage(null);
    }, []);

    const setNetWeight = useCallback((netWeightKg: string) => {
        const sanitized = sanitizeReleaseNumericInput(netWeightKg);
        setForm((prev) => ({
            ...prev,
            netWeightKg: sanitized,
            grossWeightKg: sanitized,
        }));
        setRegisterSubmitError(null);
        setRegisterSubmitMessage(null);
    }, []);

    const toggleProductionEventSignal = useCallback(
        (rowId: string) => {
            const nextSelectedId = selectedProductionEventId === rowId ? null : rowId;

            if (nextSelectedId) {
                const row = productionEvent.eventList.find((item) => item.id === nextSelectedId);
                const lengthM = row ? getReleaseProductionEventCellValue(row, "length_m") : null;

                if (lengthM !== null && lengthM !== undefined && lengthM !== "") {
                    patchForm({ lengthM: String(lengthM) });
                } else {
                    patchForm({ lengthM: "" });
                }
            } else {
                clearSignalPrefillFields();
            }

            setSelectedProductionEventId(nextSelectedId);
        },
        [clearSignalPrefillFields, patchForm, productionEvent.eventList, selectedProductionEventId],
    );

    const toggleBatchRollSelection = useCallback((rowId: string) => {
        setSelectedBatchRollIds((prev) => {
            const next = new Set(prev);
            if (next.has(rowId)) {
                next.delete(rowId);
            } else {
                next.add(rowId);
            }
            return next;
        });
        setBlockSubmitError(null);
        setBlockSubmitMessage(null);
    }, []);

    const selectBlockReason = useCallback((code: string | null) => {
        setSelectedBlockReasonCode(code);
        setBlockSubmitError(null);
        setBlockSubmitMessage(null);
    }, []);

    const selectedBlockSeriesRefs = useMemo(
        () => collectReleaseBlockSeriesRefs(batchSnapshot.rows, selectedBatchRollIds),
        [batchSnapshot.rows, selectedBatchRollIds],
    );

    const canSubmitBlock = selectedBlockSeriesRefs.length > 0 && Boolean(selectedBlockReasonCode?.trim());

    const submitBatchBlock = useCallback(async () => {
        const reasonCode = selectedBlockReasonCode?.trim();
        if (!reasonCode) {
            setBlockSubmitError("Выберите причину блокировки");
            return;
        }

        if (selectedBlockSeriesRefs.length === 0) {
            setBlockSubmitError("Выберите выпуски партии с непустой серией");
            return;
        }

        setIsSubmittingBlock(true);
        setBlockSubmitError(null);
        setBlockSubmitMessage(null);

        try {
            const body = buildReleaseSubmitBlockBody({
                batchRolls: batchSnapshot.rows,
                selectedBatchRollIds,
                reasonCode,
                comment: blockComment,
            });
            const payload = await submitBlockRequestRef.current({ body });
            const result = mapReleaseSubmitBlockPayload(payload);
            setBlockSubmitMessage(result.message);
            setSelectedBatchRollIds(new Set());
            setBlockComment("");
            setSelectedBlockReasonCode(null);

            const trimmedWorkAreaId = workAreaId?.trim();
            if (trimmedWorkAreaId) {
                await loadReleaseFormData(trimmedWorkAreaId);
            }
        } catch (submitError) {
            setBlockSubmitError(
                submitError instanceof Error ? submitError.message : "Не удалось передать блокировку",
            );
        } finally {
            setIsSubmittingBlock(false);
        }
    }, [
        batchSnapshot.rows,
        blockComment,
        loadReleaseFormData,
        selectedBatchRollIds,
        selectedBlockReasonCode,
        selectedBlockSeriesRefs.length,
        workAreaId,
    ]);

    const parsedLength = Number(form.lengthM.trim().replace(",", "."));
    const parsedWeight = Number(form.netWeightKg.trim().replace(",", "."));
    const canRegisterRelease =
        Boolean(workAreaId?.trim()) &&
        Boolean(initSnapshot.predictedExternalSeriesKey.trim()) &&
        Boolean(form.warehouse.trim()) &&
        Number.isFinite(parsedLength) &&
        parsedLength > 0 &&
        Number.isFinite(parsedWeight) &&
        parsedWeight > 0;

    const registerRelease = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        const seriesKey = initSnapshot.predictedExternalSeriesKey.trim();
        const warehouseCode = form.warehouse.trim();

        if (!trimmedWorkAreaId) {
            setRegisterSubmitError("Не удалось определить workAreaId этапа");
            return;
        }

        if (!seriesKey) {
            setRegisterSubmitError("Не удалось определить серию выпуска");
            return;
        }

        if (!warehouseCode) {
            setRegisterSubmitError("Выберите склад назначения");
            return;
        }

        if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
            setRegisterSubmitError("Укажите метраж больше нуля");
            return;
        }

        if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
            setRegisterSubmitError("Укажите вес больше нуля");
            return;
        }

        const body = buildReleaseRegisterBody({
            workAreaId: trimmedWorkAreaId,
            seriesKey,
            length: parsedLength,
            weight: parsedWeight,
            rewind: form.requiresRewind,
            lastRoll: form.isLastRoll,
            warehouseCode,
            idEvent: selectedProductionEventId ?? "",
        });

        setIsRegisteringRelease(true);
        setRegisterSubmitError(null);
        setRegisterSubmitMessage(null);

        try {
            const payload = await registerReleaseRequestRef.current({ body });
            const result = mapReleaseRegisterPayload(payload);
            setRegisterSubmitMessage(result.message);
            setRegisterSubmitMessageKey((key) => key + 1);
            setForm((prev) => ({
                ...prev,
                lengthM: "",
                netWeightKg: "",
                grossWeightKg: "",
                requiresRewind: false,
                isLastRoll: false,
            }));
            setSelectedProductionEventId(null);
            await load();
            onReleaseRegisteredRef.current?.();
        } catch (registerError) {
            setRegisterSubmitError(
                registerError instanceof Error ? registerError.message : "Не удалось зарегистрировать выпуск",
            );
        } finally {
            setIsRegisteringRelease(false);
        }
    }, [
        form.isLastRoll,
        form.requiresRewind,
        form.warehouse,
        initSnapshot.predictedExternalSeriesKey,
        load,
        parsedLength,
        parsedWeight,
        selectedProductionEventId,
        workAreaId,
    ]);

    const printReleaseLabel = useCallback(
        async (materialProductionReleaseId: string) => {
            const trimmedWorkAreaId = workAreaId?.trim();
            const trimmedReleaseId = materialProductionReleaseId.trim();

            if (!trimmedWorkAreaId) {
                setPrintError("Не удалось определить workAreaId этапа");
                return;
            }

            if (!trimmedReleaseId) {
                setPrintError("Не удалось определить идентификатор выпуска");
                return;
            }

            setPrintingReleaseId(trimmedReleaseId);
            setPrintError(null);

            try {
                const payload = await prepareReleaseLabelRequestRef.current({
                    body: buildReleasePrintLabelBody({
                        workAreaId: trimmedWorkAreaId,
                        materialProductionReleaseId: trimmedReleaseId,
                    }),
                });
                const previewFilePath = mapPrepareReleaseLabelPayload(payload);
                window.open(previewFilePath, "_blank", "noopener,noreferrer");
            } catch (printLabelError) {
                setPrintError(
                    printLabelError instanceof Error ? printLabelError.message : "Не удалось напечатать этикетку",
                );
            } finally {
                setPrintingReleaseId(null);
            }
        },
        [workAreaId],
    );

    return {
        form,
        patchForm,
        setNetWeight,
        series: initSnapshot.predictedExternalSeriesKey,
        warehouseOptions: initSnapshot.warehouseOptions,
        batchRolls: batchSnapshot.rows,
        batchAsOf: batchSnapshot.asOf,
        selectedBatchRollIds,
        toggleBatchRollSelection,
        blockReasons,
        isBlockReasonsLoading,
        blockReasonsError,
        reloadBlockReasons,
        selectedBlockReasonCode,
        selectBlockReason,
        blockComment,
        setBlockComment,
        canSubmitBlock,
        isSubmittingBlock,
        blockSubmitError,
        blockSubmitMessage,
        submitBatchBlock,
        productionEvent,
        isProductionEventLoading,
        productionEventError,
        selectedProductionEventId,
        toggleProductionEventSignal,
        reloadProductionEventsSilent,
        isLoading,
        error,
        reload: load,
        canRegisterRelease,
        isRegisteringRelease,
        registerSubmitError,
        registerSubmitMessage,
        registerSubmitMessageKey,
        dismissRegisterSubmitMessage,
        registerRelease,
        printError,
        printingReleaseId,
        printReleaseLabel,
    };
}
