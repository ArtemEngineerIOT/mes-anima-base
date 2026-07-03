import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { mapReleaseBlockReasonsPayload } from "./map-release-block-reasons-payload";
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

type UseReleaseOptions = {
    workAreaId?: string;
    enabled: boolean;
};

export function useRelease({ workAreaId, enabled }: UseReleaseOptions) {
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

    const resetState = useCallback(() => {
        setInitSnapshot(RELEASE_EMPTY_INIT);
        setBatchSnapshot(RELEASE_EMPTY_BATCH_SNAPSHOT);
        setInputRolls([]);
        setBlockReasons([]);
        setForm(RELEASE_INITIAL_FORM);
        setError(null);
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

        try {
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
        } catch (loadError) {
            resetState();
            setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить данные выпуска");
        } finally {
            setIsLoading(false);
        }
    }, [resetState, workAreaId]);

    useEffect(() => {
        if (!enabled) {
            setIsLoading(false);
            return;
        }

        void load();
    }, [enabled, load]);

    const patchForm = useCallback((patch: Partial<ReleaseFormState>) => {
        setForm((prev) => ({ ...prev, ...patch }));
        setRegisterSubmitError(null);
        setRegisterSubmitMessage(null);
    }, []);

    const setNetWeight = useCallback((netWeightKg: string) => {
        setForm((prev) => ({
            ...prev,
            netWeightKg,
            grossWeightKg: netWeightKg,
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
