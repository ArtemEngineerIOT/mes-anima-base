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

/** Сообщение snackbar (выпуск / блокировка). */
export type ReleasePanelFeedback = {
    key: number;
    title: string;
    description?: string;
    tone: "success" | "alert";
};

/** @deprecated Используйте {@link TRANSIENT_INFORMER_VISIBLE_MS} из `@/shared/ui/kit/auto-dismiss-informer` */
export { TRANSIENT_INFORMER_VISIBLE_MS as REGISTER_SUBMIT_MESSAGE_VISIBLE_MS } from "@/shared/ui/kit/auto-dismiss-informer";
/** @deprecated Используйте {@link TRANSIENT_INFORMER_FADE_MS} из `@/shared/ui/kit/auto-dismiss-informer` */
export { TRANSIENT_INFORMER_FADE_MS as REGISTER_SUBMIT_MESSAGE_FADE_MS } from "@/shared/ui/kit/auto-dismiss-informer";

export function useRelease({ workAreaId, enabled, onReleaseRegistered }: UseReleaseOptions) {
    const [form, setForm] = useState<ReleaseFormState>(RELEASE_INITIAL_FORM);
    const [initSnapshot, setInitSnapshot] = useState<ReleaseInitSnapshot>(RELEASE_EMPTY_INIT);
    const [batchSnapshot, setBatchSnapshot] = useState<ReleaseBatchSnapshot>(RELEASE_EMPTY_BATCH_SNAPSHOT);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRegisteringRelease, setIsRegisteringRelease] = useState(false);
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
    const [panelFeedback, setPanelFeedback] = useState<ReleasePanelFeedback | null>(null);
    const panelFeedbackKeyRef = useRef(0);

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
        setPanelFeedback(null);
    }, [resetFormState]);

    const dismissPanelFeedback = useCallback(() => {
        setPanelFeedback(null);
    }, []);

    const showPanelFeedback = useCallback(
        (title: string, tone: ReleasePanelFeedback["tone"], description?: string) => {
            panelFeedbackKeyRef.current += 1;
            setPanelFeedback({
                key: panelFeedbackKeyRef.current,
                title,
                description,
                tone,
            });
        },
        [],
    );

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
        setPanelFeedback(null);
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

    /** Сворачивание / разворачивание блока — сразу убираем всплывающие информеры */
    useEffect(() => {
        setPanelFeedback(null);
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
        setPanelFeedback(null);
    }, []);

    const setNetWeight = useCallback((netWeightKg: string) => {
        const sanitized = sanitizeReleaseNumericInput(netWeightKg);
        setForm((prev) => ({
            ...prev,
            netWeightKg: sanitized,
            grossWeightKg: sanitized,
        }));
        setPanelFeedback(null);
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
        setPanelFeedback(null);
    }, []);

    const selectBlockReason = useCallback((code: string | null) => {
        setSelectedBlockReasonCode(code);
        setPanelFeedback(null);
    }, []);

    const selectedBlockSeriesRefs = useMemo(
        () => collectReleaseBlockSeriesRefs(batchSnapshot.rows, selectedBatchRollIds),
        [batchSnapshot.rows, selectedBatchRollIds],
    );

    const canSubmitBlock = selectedBlockSeriesRefs.length > 0 && Boolean(selectedBlockReasonCode?.trim());

    const submitBatchBlock = useCallback(async () => {
        const reasonCode = selectedBlockReasonCode?.trim();
        if (!reasonCode) {
            showPanelFeedback("Выберите причину блокировки", "alert");
            return;
        }

        if (selectedBlockSeriesRefs.length === 0) {
            showPanelFeedback("Выберите выпуски партии с непустой серией", "alert");
            return;
        }

        setIsSubmittingBlock(true);
        setPanelFeedback(null);

        try {
            const body = buildReleaseSubmitBlockBody({
                batchRolls: batchSnapshot.rows,
                selectedBatchRollIds,
                reasonCode,
                comment: blockComment,
            });
            const payload = await submitBlockRequestRef.current({ body });
            const result = mapReleaseSubmitBlockPayload(payload);
            showPanelFeedback(result.message, "success");
            setSelectedBatchRollIds(new Set());
            setBlockComment("");
            setSelectedBlockReasonCode(null);

            const trimmedWorkAreaId = workAreaId?.trim();
            if (trimmedWorkAreaId) {
                await loadReleaseFormData(trimmedWorkAreaId);
            }
        } catch (submitError) {
            showPanelFeedback(
                "Ошибка",
                "alert",
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
        showPanelFeedback,
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
            showPanelFeedback("Не удалось определить workAreaId этапа", "alert");
            return;
        }

        if (!seriesKey) {
            showPanelFeedback("Не удалось определить серию выпуска", "alert");
            return;
        }

        if (!warehouseCode) {
            showPanelFeedback("Выберите склад назначения", "alert");
            return;
        }

        if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
            showPanelFeedback("Укажите метраж больше нуля", "alert");
            return;
        }

        if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
            showPanelFeedback("Укажите вес больше нуля", "alert");
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
        setPanelFeedback(null);

        try {
            const payload = await registerReleaseRequestRef.current({ body });
            const result = mapReleaseRegisterPayload(payload);
            showPanelFeedback(result.message, "success");
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
            showPanelFeedback(
                "Ошибка",
                "alert",
                registerError instanceof Error
                    ? registerError.message
                    : "Не удалось зарегистрировать выпуск",
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
        showPanelFeedback,
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

    const dismissPrintError = useCallback(() => setPrintError(null), []);

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
        panelFeedback,
        dismissPanelFeedback,
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
        registerRelease,
        printError,
        dismissPrintError,
        printingReleaseId,
        printReleaseLabel,
    };
}
