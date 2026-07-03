import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import {
    buildPrefillSeriesDraft,
    mapActiveInputPrefillPayload,
} from "./map-active-input-prefill-payload";
import { mapMaterialsWriteoffPayload } from "./map-materials-writeoff-payload";
import { mapRegisterMaterialFullWriteoffPayload } from "./map-register-material-full-writeoff-payload";
import { mapRegisterMaterialReturnPayload } from "./map-register-material-return-payload";
import {
    canCalculateWriteoffWeight,
    EMPTY_MATERIALS_WRITEOFF_FORM,
    isMaterialFullWriteoffReady,
    isMaterialsWriteoffFormReady,
    MATERIALS_WRITEOFF_WAREHOUSE_OPTIONS,
    parseWriteoffLength,
    parseWriteoffWeight,
    sanitizeWriteoffMetersInput,
} from "./materials-writeoff-form";
import type { MaterialsWriteoffFormState } from "./materials-writeoff-form";
import { useMaterialsWriteoffStageRegistry } from "./use-materials-writeoff-stage-registry";
import { useMaterialsWriteoffWeight } from "./use-materials-writeoff-weight";
import type { MaterialsWriteoffData } from "./types";

export type MaterialsWriteoffPrefillHint = "active" | "empty" | null;

type UseMaterialsWriteoffOptions = {
    workAreaId?: string;
    enabled?: boolean;
};

export function useMaterialsWriteoff({ workAreaId, enabled = true }: UseMaterialsWriteoffOptions) {
    const [barcode, setBarcode] = useState("");
    const [data, setData] = useState<MaterialsWriteoffData | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [prefillError, setPrefillError] = useState<string | null>(null);
    const [prefillHint, setPrefillHint] = useState<MaterialsWriteoffPrefillHint>(null);
    const [isPrefillLoading, setIsPrefillLoading] = useState(false);
    const [expandedOpId, setExpandedOpId] = useState<string | null>(null);
    const [stageRegistryRefreshKey, setStageRegistryRefreshKey] = useState(0);
    const [writeoffForm, setWriteoffForm] = useState<MaterialsWriteoffFormState>(EMPTY_MATERIALS_WRITEOFF_FORM);
    const [isReflectingReturn, setIsReflectingReturn] = useState(false);
    const [reflectReturnError, setReflectReturnError] = useState<string | null>(null);
    const [isWritingOffFully, setIsWritingOffFully] = useState(false);
    const [writeOffFullyError, setWriteOffFullyError] = useState<string | null>(null);

    const { mutateAsync: fetchMaterialSeries } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getOrderExecutionMaterialSeries,
        {},
    );

    const fetchMaterialSeriesRef = useRef(fetchMaterialSeries);
    fetchMaterialSeriesRef.current = fetchMaterialSeries;

    const { mutateAsync: fetchActiveInputPrefill } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getActiveInputPrefill,
        {},
    );

    const fetchActiveInputPrefillRef = useRef(fetchActiveInputPrefill);
    fetchActiveInputPrefillRef.current = fetchActiveInputPrefill;

    const { mutateAsync: registerMaterialReturn } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.registerOrderExecutionMaterialReturn,
        {},
    );

    const registerMaterialReturnRef = useRef(registerMaterialReturn);
    registerMaterialReturnRef.current = registerMaterialReturn;

    const { mutateAsync: registerMaterialFullWriteoff } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.registerOrderExecutionMaterialFullWriteoff,
        {},
    );

    const registerMaterialFullWriteoffRef = useRef(registerMaterialFullWriteoff);
    registerMaterialFullWriteoffRef.current = registerMaterialFullWriteoff;

    const showWriteoffFlow = Boolean(data && !data.stageSpecBannerVisible);

    const { calculate, reset, isLoading: isWriteoffWeightLoading, error: writeoffWeightError } =
        useMaterialsWriteoffWeight({ workAreaId });

    const resetSearchState = useCallback(() => {
        setData(null);
        setExpandedOpId(null);
        setWriteoffForm(EMPTY_MATERIALS_WRITEOFF_FORM);
        reset();
    }, [reset]);

    const searchByBarcode = useCallback(
        async (barcodeValue: string) => {
            if (!barcodeValue.trim()) {
                setSearchError("Укажите штрихкод серии");
                return;
            }

            const trimmedWorkAreaId = workAreaId?.trim();
            if (!trimmedWorkAreaId) {
                setSearchError("Не удалось определить workAreaId этапа");
                return;
            }

            setIsSearching(true);
            setSearchError(null);
            setPrefillHint(null);

            try {
                const payload = await fetchMaterialSeriesRef.current({
                    body: [{ barcode: barcodeValue, workAreaId: trimmedWorkAreaId }],
                });
                const mapped = mapMaterialsWriteoffPayload(payload);
                setData(mapped);
                setExpandedOpId(null);
                if (mapped.stageRegistryRefreshHint) {
                    setStageRegistryRefreshKey((prev) => prev + 1);
                }
                setWriteoffForm(EMPTY_MATERIALS_WRITEOFF_FORM);
                reset();
            } catch (error) {
                resetSearchState();
                setSearchError(error instanceof Error ? error.message : "Не удалось найти серию");
            } finally {
                setIsSearching(false);
            }
        },
        [reset, resetSearchState, workAreaId],
    );

    const search = useCallback(async () => {
        await searchByBarcode(barcode);
    }, [barcode, searchByBarcode]);

    const loadActiveInputPrefill = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            setBarcode("");
            resetSearchState();
            setPrefillError("Не удалось определить workAreaId этапа");
            return;
        }

        setIsPrefillLoading(true);
        setPrefillError(null);
        setPrefillHint(null);
        setSearchError(null);
        setBarcode("");
        resetSearchState();

        try {
            const payload = await fetchActiveInputPrefillRef.current({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });
            const mapped = mapActiveInputPrefillPayload(payload);

            if (mapped.shouldPrefillScan && mapped.activeInputRoll) {
                const { seriesKey } = mapped.activeInputRoll;
                setBarcode(seriesKey);
                setData(buildPrefillSeriesDraft(mapped.activeInputRoll));
                setPrefillHint("active");
                setStageRegistryRefreshKey((prev) => prev + 1);
                return;
            }

            setBarcode("");
            resetSearchState();
            setPrefillHint("empty");
        } catch (error) {
            setBarcode("");
            resetSearchState();
            setPrefillHint(null);
            setPrefillError(
                error instanceof Error ? error.message : "Не удалось загрузить предзаполнение поля скана",
            );
        } finally {
            setIsPrefillLoading(false);
        }
    }, [resetSearchState, workAreaId]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        void loadActiveInputPrefill();
    }, [enabled, loadActiveInputPrefill]);

    const stageRegistry = useMaterialsWriteoffStageRegistry({
        workAreaId,
        enabled: showWriteoffFlow,
        refreshKey: stageRegistryRefreshKey,
    });

    const updateWriteoffForm = useCallback(
        (patch: Partial<MaterialsWriteoffFormState>) => {
            if ("weight" in patch) {
                return;
            }

            setWriteoffForm((prev) => {
                const normalizedPatch = { ...patch };
                if ("meters" in normalizedPatch && typeof normalizedPatch.meters === "string") {
                    normalizedPatch.meters = sanitizeWriteoffMetersInput(normalizedPatch.meters);
                }

                const next = { ...prev, ...normalizedPatch };
                if ("meters" in normalizedPatch && normalizedPatch.meters !== prev.meters) {
                    next.weight = "";
                }
                return next;
            });

            if ("meters" in patch) {
                reset();
            }
        },
        [reset],
    );

    const calculateWriteoffWeight = useCallback(async () => {
        const weight = await calculate(writeoffForm.meters);
        setWriteoffForm((prev) => ({
            ...prev,
            weight: weight ?? "",
        }));
    }, [calculate, writeoffForm.meters]);

    const reflectMaterialReturn = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        const length = parseWriteoffLength(writeoffForm.meters);
        const weight = parseWriteoffWeight(writeoffForm.weight);
        const warehouse = writeoffForm.warehouse.trim();

        if (!trimmedWorkAreaId) {
            setReflectReturnError("Не удалось определить workAreaId этапа");
            return;
        }

        if (!barcode.trim()) {
            setReflectReturnError("Не удалось определить штрихкод серии");
            return;
        }

        if (length === null || weight === null || !warehouse) {
            setReflectReturnError("Заполните метраж, вес и склад");
            return;
        }

        setIsReflectingReturn(true);
        setReflectReturnError(null);

        try {
            const payload = await registerMaterialReturnRef.current({
                body: [
                    {
                        workAreaId: trimmedWorkAreaId,
                        barcode,
                        length,
                        weight,
                        warehouse,
                    },
                ],
            });
            const result = mapRegisterMaterialReturnPayload(payload);
            if (result.stageRegistryRefreshHint) {
                setStageRegistryRefreshKey((prev) => prev + 1);
            }
            setWriteoffForm(EMPTY_MATERIALS_WRITEOFF_FORM);
            reset();
        } catch (error) {
            setReflectReturnError(error instanceof Error ? error.message : "Не удалось отразить возврат");
        } finally {
            setIsReflectingReturn(false);
        }
    }, [barcode, reset, workAreaId, writeoffForm.meters, writeoffForm.weight, writeoffForm.warehouse]);

    const writeOffMaterialFully = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        const warehouse = writeoffForm.warehouse.trim();

        if (!trimmedWorkAreaId) {
            setWriteOffFullyError("Не удалось определить workAreaId этапа");
            return;
        }

        if (!barcode.trim()) {
            setWriteOffFullyError("Не удалось определить штрихкод серии");
            return;
        }

        if (!warehouse) {
            setWriteOffFullyError("Выберите склад");
            return;
        }

        setIsWritingOffFully(true);
        setWriteOffFullyError(null);

        try {
            const payload = await registerMaterialFullWriteoffRef.current({
                body: [
                    {
                        workAreaId: trimmedWorkAreaId,
                        barcode,
                        warehouse,
                    },
                ],
            });
            const result = mapRegisterMaterialFullWriteoffPayload(payload);
            if (result.stageRegistryRefreshHint) {
                setStageRegistryRefreshKey((prev) => prev + 1);
            }
            setWriteoffForm(EMPTY_MATERIALS_WRITEOFF_FORM);
            reset();
            await loadActiveInputPrefill();
        } catch (error) {
            setWriteOffFullyError(error instanceof Error ? error.message : "Не удалось списать материал полностью");
        } finally {
            setIsWritingOffFully(false);
        }
    }, [barcode, loadActiveInputPrefill, reset, workAreaId, writeoffForm.warehouse]);

    const canCalculateWeight = canCalculateWriteoffWeight(writeoffForm.meters);
    const isWriteoffActionInProgress = isReflectingReturn || isWritingOffFully;
    const isReflectReturnEnabled = isMaterialsWriteoffFormReady(writeoffForm) && !isWriteoffActionInProgress;
    const isFullWriteoffEnabled = isMaterialFullWriteoffReady(writeoffForm) && !isWriteoffActionInProgress;
    const isWriteoffActionsEnabled = isMaterialsWriteoffFormReady(writeoffForm) && !isWriteoffActionInProgress;
    const isScanFieldBusy = isPrefillLoading || isSearching;

    return {
        barcode,
        setBarcode,
        data,
        writeoffForm,
        updateWriteoffForm,
        calculateWriteoffWeight,
        reflectMaterialReturn,
        writeOffMaterialFully,
        canCalculateWeight,
        isReflectReturnEnabled,
        isFullWriteoffEnabled,
        isWriteoffActionsEnabled,
        isReflectingReturn,
        isWritingOffFully,
        reflectReturnError,
        writeOffFullyError,
        warehouseOptions: MATERIALS_WRITEOFF_WAREHOUSE_OPTIONS,
        writeoffWeightError,
        isWriteoffWeightLoading,
        showWriteoffFlow,
        stageRegistry,
        isSearching,
        isPrefillLoading,
        prefillError,
        prefillHint,
        searchError,
        expandedOpId,
        setExpandedOpId,
        search,
        canSearch: Boolean(workAreaId?.trim()) && !isScanFieldBusy,
        isScanFieldBusy,
    };
}
