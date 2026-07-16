import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useSession } from "@/shared/model/session";

import { mapReleaseBlockReasonsPayload } from "./map-release-block-reasons-payload";
import { mapEventReleaseProductionPayload } from "./map-event-release-production-payload";
import { buildDiscardProductionEventBody } from "./build-discard-production-event-body";
import { mapDiscardProductionEventPayload } from "./map-discard-production-event-payload";
import { buildAcceptProdFromEventBody } from "./build-accept-prod-from-event-body";
import { mapAcceptProdFromEventPayload } from "./map-accept-prod-from-event-payload";
import { buildReleaseSubmitBlockBody } from "./build-release-submit-block-body";
import { buildReleaseRegisterBody } from "./build-release-register-body";
import { buildReleasePrintLabelBody } from "./build-release-print-label-body";
import { mapReleaseSubmitBlockPayload } from "./map-release-submit-block-payload";
import { mapReleaseRegisterPayload } from "./map-release-register-payload";
import { mapPrepareReleaseLabelPayload } from "./map-prepare-release-label-payload";
import {
    mapReleaseBatchReleasesPayload,
    RELEASE_EMPTY_BATCH_SNAPSHOT,
    type ReleaseBatchSnapshot,
} from "./map-release-batch-releases-payload";
import { mapReleaseFormInitPayload } from "./map-release-form-init-payload";
import { mapReleaseInputRollsPayload } from "./map-release-input-rolls-payload";
import type { ReleaseBlockReason, ReleaseFormState, ReleaseInitSnapshot, ReleaseInputRollRow } from "./types";
import { RELEASE_EMPTY_INIT, RELEASE_INITIAL_FORM } from "./types";
import {
    RELEASE_EMPTY_PRODUCTION_EVENT,
    type ReleaseProductionEventSnapshot,
} from "./production-event-types";
import { resolveReleaseOperatorRef } from "./resolve-release-operator-ref";
import { sanitizeReleaseNumericInput } from "./sanitize-release-numeric-input";

type UseReleaseOptions = {
    workAreaId?: string;
    enabled: boolean;
};

export function useRelease({ workAreaId, enabled }: UseReleaseOptions) {
    const { session } = useSession();
    const [form, setForm] = useState<ReleaseFormState>(RELEASE_INITIAL_FORM);
    const [initSnapshot, setInitSnapshot] = useState<ReleaseInitSnapshot>(RELEASE_EMPTY_INIT);
    const [batchSnapshot, setBatchSnapshot] = useState<ReleaseBatchSnapshot>(RELEASE_EMPTY_BATCH_SNAPSHOT);
    const [inputRolls, setInputRolls] = useState<ReleaseInputRollRow[]>([]);
    const [blockReasons, setBlockReasons] = useState<ReleaseBlockReason[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);
    const [blockSubmitError, setBlockSubmitError] = useState<string | null>(null);
    const [blockSubmitMessage, setBlockSubmitMessage] = useState<string | null>(null);
    const [isRegisteringRelease, setIsRegisteringRelease] = useState(false);
    const [registerSubmitError, setRegisterSubmitError] = useState<string | null>(null);
    const [registerSubmitMessage, setRegisterSubmitMessage] = useState<string | null>(null);
    const [printingReleaseId, setPrintingReleaseId] = useState<string | null>(null);
    const [printError, setPrintError] = useState<string | null>(null);
    const [productionEvent, setProductionEvent] = useState<ReleaseProductionEventSnapshot>(
        RELEASE_EMPTY_PRODUCTION_EVENT,
    );
    const [isProductionEventLoading, setIsProductionEventLoading] = useState(false);
    const [productionEventError, setProductionEventError] = useState<string | null>(null);
    const [isDiscardingProductionEvent, setIsDiscardingProductionEvent] = useState(false);
    const [discardProductionEventError, setDiscardProductionEventError] = useState<string | null>(null);
    const [isAcceptingProdFromEvent, setIsAcceptingProdFromEvent] = useState(false);
    const [acceptProdFromEventError, setAcceptProdFromEventError] = useState<string | null>(null);
    const pendingPrefillRef = useRef<{ lengthM: string; netWeightKg: string } | null>(null);

    const { mutateAsync: fetchReleaseProductionEvent } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.eventReleaseProduction,
        {},
    );
    const { mutateAsync: discardProductionEventRequest } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.discardEvent,
        {},
    );
    const { mutateAsync: acceptProdFromEventRequest } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.acceptProdFromEvent,
        {},
    );
    const { mutateAsync: fetchReleaseFormInit } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getReleaseFormInit,
        {},
    );
    const { mutateAsync: fetchBatchReleases } = rqClient.useMutation("post", REST_FUNCTION_PATHS.getBatchReleases, {});
    const { mutateAsync: fetchInputRolls } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.listStageInputRollsForWorkArea,
        {},
    );
    const { mutateAsync: listBlockReasons } = rqClient.useMutation("post", REST_FUNCTION_PATHS.listBlockReasons, {});
    const { mutateAsync: submitBlockRequest } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.submitBlockRequest,
        {},
    );
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

    const fetchReleaseProductionEventRef = useRef(fetchReleaseProductionEvent);
    fetchReleaseProductionEventRef.current = fetchReleaseProductionEvent;
    const discardProductionEventRequestRef = useRef(discardProductionEventRequest);
    discardProductionEventRequestRef.current = discardProductionEventRequest;
    const acceptProdFromEventRequestRef = useRef(acceptProdFromEventRequest);
    acceptProdFromEventRequestRef.current = acceptProdFromEventRequest;
    const fetchReleaseFormInitRef = useRef(fetchReleaseFormInit);
    fetchReleaseFormInitRef.current = fetchReleaseFormInit;
    const fetchBatchReleasesRef = useRef(fetchBatchReleases);
    fetchBatchReleasesRef.current = fetchBatchReleases;
    const fetchInputRollsRef = useRef(fetchInputRolls);
    fetchInputRollsRef.current = fetchInputRolls;
    const listBlockReasonsRef = useRef(listBlockReasons);
    listBlockReasonsRef.current = listBlockReasons;
    const submitBlockRequestRef = useRef(submitBlockRequest);
    submitBlockRequestRef.current = submitBlockRequest;
    const registerReleaseRequestRef = useRef(registerReleaseRequest);
    registerReleaseRequestRef.current = registerReleaseRequest;
    const prepareReleaseLabelRequestRef = useRef(prepareReleaseLabelRequest);
    prepareReleaseLabelRequestRef.current = prepareReleaseLabelRequest;

    const resetFormState = useCallback(() => {
        setInitSnapshot(RELEASE_EMPTY_INIT);
        setBatchSnapshot(RELEASE_EMPTY_BATCH_SNAPSHOT);
        setInputRolls([]);
        setBlockReasons([]);
        setForm(RELEASE_INITIAL_FORM);
        setError(null);
    }, []);

    const resetState = useCallback(() => {
        resetFormState();
        setProductionEvent(RELEASE_EMPTY_PRODUCTION_EVENT);
        setProductionEventError(null);
        setDiscardProductionEventError(null);
        setAcceptProdFromEventError(null);
        pendingPrefillRef.current = null;
    }, [resetFormState]);

    const applyPendingPrefill = useCallback(() => {
        const pendingPrefill = pendingPrefillRef.current;
        if (!pendingPrefill) {
            return;
        }

        pendingPrefillRef.current = null;
        setForm((prev) => ({
            ...prev,
            lengthM: sanitizeReleaseNumericInput(pendingPrefill.lengthM),
            netWeightKg: sanitizeReleaseNumericInput(pendingPrefill.netWeightKg),
            grossWeightKg: sanitizeReleaseNumericInput(pendingPrefill.netWeightKg),
        }));
    }, []);

    const loadProductionEvent = useCallback(async (trimmedWorkAreaId: string) => {
        setIsProductionEventLoading(true);
        setProductionEventError(null);

        try {
            const productionEventPayload = await fetchReleaseProductionEventRef.current({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });
            const mapped = mapEventReleaseProductionPayload(productionEventPayload);
            setProductionEvent(mapped);
            if (!mapped.manualReleaseBlocked) {
                applyPendingPrefill();
            }
        } catch (loadError) {
            setProductionEvent(RELEASE_EMPTY_PRODUCTION_EVENT);
            setProductionEventError(
                loadError instanceof Error
                    ? loadError.message
                    : "Не удалось загрузить событие выпуска с машины",
            );
        } finally {
            setIsProductionEventLoading(false);
        }
    }, [applyPendingPrefill]);

    const loadReleaseFormData = useCallback(async (trimmedWorkAreaId: string) => {
        const requestBody = [{ workAreaId: trimmedWorkAreaId }] as const;

        const [initPayload, batchPayload, inputRollsPayload, blockReasonsPayload] = await Promise.all([
            fetchReleaseFormInitRef.current({ body: [...requestBody] }),
            fetchBatchReleasesRef.current({ body: [...requestBody] }),
            fetchInputRollsRef.current({ body: [...requestBody] }),
            listBlockReasonsRef.current({ body: [] }),
        ]);

        const mappedInit = mapReleaseFormInitPayload(initPayload);
        const mappedBatch = mapReleaseBatchReleasesPayload(batchPayload);
        const mappedInputRolls = mapReleaseInputRollsPayload(inputRollsPayload);
        const mappedBlockReasons = mapReleaseBlockReasonsPayload(blockReasonsPayload);

        setInitSnapshot(mappedInit);
        setBatchSnapshot(mappedBatch);
        setInputRolls(mappedInputRolls.rows);
        setBlockReasons(mappedBlockReasons);
        setForm({
            ...RELEASE_INITIAL_FORM,
            warehouse: mappedInit.defaultWarehouseCode,
            blockReason: mappedBlockReasons[0]?.reasonCode ?? "",
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

    const toggleInputRoll = useCallback((rollId: string) => {
        setForm((prev) => {
            const exists = prev.selectedInputRollIds.includes(rollId);
            return {
                ...prev,
                selectedInputRollIds: exists
                    ? prev.selectedInputRollIds.filter((id) => id !== rollId)
                    : [...prev.selectedInputRollIds, rollId],
            };
        });
    }, []);

    const setBlockReason = useCallback((reasonCode: string) => {
        setForm((prev) => ({
            ...prev,
            blockReason: reasonCode,
        }));
        setBlockSubmitError(null);
        setBlockSubmitMessage(null);
    }, []);

    const canSubmitBlock =
        form.selectedInputRollIds.length > 0 && Boolean(form.blockReason.trim());

    const submitBlock = useCallback(async () => {
        const reasonCode = form.blockReason.trim();
        if (!reasonCode) {
            setBlockSubmitError("Выберите причину блокировки");
            return;
        }

        if (form.selectedInputRollIds.length === 0) {
            setBlockSubmitError("Выберите хотя бы один входной рулон");
            return;
        }

        const body = buildReleaseSubmitBlockBody({
            inputRolls,
            selectedInputRollIds: form.selectedInputRollIds,
            reasonCode,
            comment: form.warehouseComment,
        });

        if (!body[0]?.seriesRefs) {
            setBlockSubmitError("У выбранных рулонов нет серии для блокировки");
            return;
        }

        setIsSubmittingBlock(true);
        setBlockSubmitError(null);
        setBlockSubmitMessage(null);

        try {
            const payload = await submitBlockRequestRef.current({ body });
            const result = mapReleaseSubmitBlockPayload(payload);
            setBlockSubmitMessage(result.message);
            setForm((prev) => ({
                ...prev,
                selectedInputRollIds: [],
                warehouseComment: "",
            }));
            await load();
        } catch (submitBlockError) {
            setBlockSubmitError(
                submitBlockError instanceof Error
                    ? submitBlockError.message
                    : "Не удалось передать блокировку",
            );
        } finally {
            setIsSubmittingBlock(false);
        }
    }, [form.blockReason, form.selectedInputRollIds, form.warehouseComment, inputRolls, load]);

    const parsedLength = Number(form.lengthM.trim().replace(",", "."));
    const parsedWeight = Number(form.netWeightKg.trim().replace(",", "."));
    const canRegisterRelease =
        !productionEvent.manualReleaseBlocked &&
        Boolean(workAreaId?.trim()) &&
        Boolean(initSnapshot.predictedExternalSeriesKey.trim()) &&
        Boolean(form.warehouse.trim()) &&
        Number.isFinite(parsedLength) &&
        parsedLength > 0 &&
        Number.isFinite(parsedWeight) &&
        parsedWeight > 0;

    const discardProductionEvent = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        const machineEventSignalId = productionEvent.currentEvent?.machineEventSignalId.trim() ?? "";

        if (!trimmedWorkAreaId) {
            setDiscardProductionEventError("Не удалось определить workAreaId этапа");
            return;
        }

        if (!machineEventSignalId) {
            setDiscardProductionEventError("Не удалось определить идентификатор события");
            return;
        }

        const operatorRef = resolveReleaseOperatorRef(session);

        setIsDiscardingProductionEvent(true);
        setDiscardProductionEventError(null);
        setAcceptProdFromEventError(null);

        try {
            const payload = await discardProductionEventRequestRef.current({
                body: buildDiscardProductionEventBody({
                    workAreaId: trimmedWorkAreaId,
                    machineEventSignalId,
                    operatorRef: operatorRef || undefined,
                }),
            });
            mapDiscardProductionEventPayload(payload);
            await loadProductionEvent(trimmedWorkAreaId);
        } catch (discardError) {
            setDiscardProductionEventError(
                discardError instanceof Error ? discardError.message : "Не удалось отклонить событие с машины",
            );
        } finally {
            setIsDiscardingProductionEvent(false);
        }
    }, [loadProductionEvent, productionEvent.currentEvent?.machineEventSignalId, session, workAreaId]);

    const acceptProdFromEvent = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        const machineEventSignalId = productionEvent.currentEvent?.machineEventSignalId.trim() ?? "";

        if (!trimmedWorkAreaId) {
            setAcceptProdFromEventError("Не удалось определить workAreaId этапа");
            return;
        }

        if (!machineEventSignalId) {
            setAcceptProdFromEventError("Не удалось определить идентификатор события");
            return;
        }

        const operatorRef = resolveReleaseOperatorRef(session);

        setIsAcceptingProdFromEvent(true);
        setAcceptProdFromEventError(null);
        setDiscardProductionEventError(null);

        try {
            const payload = await acceptProdFromEventRequestRef.current({
                body: buildAcceptProdFromEventBody({
                    workAreaId: trimmedWorkAreaId,
                    machineEventSignalId,
                    operatorRef: operatorRef || undefined,
                }),
            });
            const result = mapAcceptProdFromEventPayload(payload);

            if (result.prefillOutputLengthM != null || result.prefillOutputWeightKg != null) {
                pendingPrefillRef.current = {
                    lengthM:
                        result.prefillOutputLengthM != null ? String(result.prefillOutputLengthM) : "",
                    netWeightKg:
                        result.prefillOutputWeightKg != null ? String(result.prefillOutputWeightKg) : "",
                };
            }

            await loadProductionEvent(trimmedWorkAreaId);
        } catch (acceptError) {
            setAcceptProdFromEventError(
                acceptError instanceof Error
                    ? acceptError.message
                    : "Не удалось зарегистрировать событие выпуска с машины",
            );
        } finally {
            setIsAcceptingProdFromEvent(false);
        }
    }, [loadProductionEvent, productionEvent.currentEvent?.machineEventSignalId, session, workAreaId]);

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
            warehouseCode,
        });

        setIsRegisteringRelease(true);
        setRegisterSubmitError(null);
        setRegisterSubmitMessage(null);

        try {
            const payload = await registerReleaseRequestRef.current({ body });
            const result = mapReleaseRegisterPayload(payload);
            setRegisterSubmitMessage(result.message);
            setForm((prev) => ({
                ...prev,
                lengthM: "",
                netWeightKg: "",
                grossWeightKg: "",
                requiresRewind: false,
            }));
            await load();
        } catch (registerError) {
            setRegisterSubmitError(
                registerError instanceof Error ? registerError.message : "Не удалось зарегистрировать выпуск",
            );
        } finally {
            setIsRegisteringRelease(false);
        }
    }, [
        form.requiresRewind,
        form.warehouse,
        initSnapshot.predictedExternalSeriesKey,
        load,
        parsedLength,
        parsedWeight,
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
        toggleInputRoll,
        setBlockReason,
        series: initSnapshot.predictedExternalSeriesKey,
        warehouseOptions: initSnapshot.warehouseOptions,
        batchRolls: batchSnapshot.rows,
        batchAsOf: batchSnapshot.asOf,
        inputRolls,
        blockReasons,
        productionEvent,
        isProductionEventLoading,
        productionEventError,
        discardProductionEvent,
        isDiscardingProductionEvent,
        discardProductionEventError,
        acceptProdFromEvent,
        isAcceptingProdFromEvent,
        acceptProdFromEventError,
        manualReleaseBlocked: productionEvent.manualReleaseBlocked,
        isLoading,
        error,
        reload: load,
        canSubmitBlock,
        isSubmittingBlock,
        blockSubmitError,
        blockSubmitMessage,
        submitBlock,
        canRegisterRelease,
        isRegisteringRelease,
        registerSubmitError,
        registerSubmitMessage,
        registerRelease,
        printError,
        printingReleaseId,
        printReleaseLabel,
    };
}
