import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { buildPresenceRowFromScan } from "./build-presence-row-from-scan";
import { mapMaterialsWriteoffPayload } from "./map-materials-writeoff-payload";
import { mapRegisterMaterialFullWriteoffPayload } from "./map-register-material-full-writeoff-payload";
import { mapRegisterMaterialReturnPayload } from "./map-register-material-return-payload";
import {
    canInstallAtUnwind,
    movePresenceRowToUnwind,
    removePresenceRow,
    resolveDefaultInstallationPlace,
    upsertPresenceRow,
} from "./materials-presence-rules";
import {
    canCalculateWriteoffWeight,
    DEFAULT_MATERIALS_INSTALLATION_PLACE,
    EMPTY_MATERIALS_WRITEOFF_FORM,
    isMaterialFullWriteoffReady,
    isMaterialsWriteoffFormReady,
    MATERIALS_INSTALLATION_PLACE_OPTIONS,
    MATERIALS_WRITEOFF_WAREHOUSE_OPTIONS,
    parseWriteoffLength,
    parseWriteoffWeight,
    sanitizeWriteoffMetersInput,
    type MaterialsInstallationPlace,
} from "./materials-writeoff-form";
import type { MaterialsWriteoffFormState } from "./materials-writeoff-form";
import { useMaterialsWriteoffStageRegistry } from "./use-materials-writeoff-stage-registry";
import { useMaterialsWriteoffWeight } from "./use-materials-writeoff-weight";
import type { MaterialsPresenceRow, MaterialsWriteoffData } from "./types";

type ScanBannerState = Pick<
    MaterialsWriteoffData,
    "stageSpecBannerVisible" | "stageSpecBannerTitle" | "stageSpecBannerDetail"
>;

type UseMaterialsWriteoffOptions = {
    workAreaId?: string;
    enabled?: boolean;
};

function buildWriteoffFormFromSelection(
    _row: MaterialsPresenceRow,
    defaults: MaterialsWriteoffData["writeoffDefaults"],
): MaterialsWriteoffFormState {
    const warehouseOptions =
        defaults?.warehouseOptions && defaults.warehouseOptions.length > 0
            ? defaults.warehouseOptions
            : MATERIALS_WRITEOFF_WAREHOUSE_OPTIONS;

    return {
        meters: defaults?.meters ?? "",
        weight: defaults?.weight ?? "",
        warehouse: defaults?.warehouse ?? warehouseOptions[0] ?? "",
    };
}

export function useMaterialsWriteoff({ workAreaId, enabled = true }: UseMaterialsWriteoffOptions) {
    const [barcode, setBarcode] = useState("");
    const [installationPlace, setInstallationPlace] = useState<MaterialsInstallationPlace>(
        DEFAULT_MATERIALS_INSTALLATION_PLACE,
    );
    const [presenceRows, setPresenceRows] = useState<MaterialsPresenceRow[]>([]);
    const [expandedPresenceRowId, setExpandedPresenceRowId] = useState<string | null>(null);
    const [selectedWriteoffRoll, setSelectedWriteoffRoll] = useState<MaterialsPresenceRow | null>(null);
    const [scanBanner, setScanBanner] = useState<ScanBannerState | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
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

    const showWriteoffFlow = selectedWriteoffRoll !== null;

    const { calculate, reset, isLoading: isWriteoffWeightLoading, error: writeoffWeightError } =
        useMaterialsWriteoffWeight({ workAreaId });

    const resetWriteoffSelection = useCallback(() => {
        setSelectedWriteoffRoll(null);
        setWriteoffForm(EMPTY_MATERIALS_WRITEOFF_FORM);
        reset();
    }, [reset]);

    useEffect(() => {
        if (!enabled) {
            setPresenceRows([]);
            setExpandedPresenceRowId(null);
            resetWriteoffSelection();
            setScanBanner(null);
            setBarcode("");
            setSearchError(null);
            setInstallationPlace(DEFAULT_MATERIALS_INSTALLATION_PLACE);
        }
    }, [enabled, resetWriteoffSelection, workAreaId]);

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
            setScanBanner(null);

            try {
                const payload = await fetchMaterialSeriesRef.current({
                    body: [
                        {
                            barcode: barcodeValue,
                            workAreaId: trimmedWorkAreaId,
                            installationPlace,
                        },
                    ],
                });
                const mapped = mapMaterialsWriteoffPayload(payload);

                if (mapped.stageSpecBannerVisible) {
                    setScanBanner({
                        stageSpecBannerVisible: true,
                        stageSpecBannerTitle: mapped.stageSpecBannerTitle,
                        stageSpecBannerDetail: mapped.stageSpecBannerDetail,
                    });
                    return;
                }

                const nextRow = buildPresenceRowFromScan({
                    barcode: barcodeValue,
                    installationPlace,
                    data: mapped,
                });

                if (!nextRow) {
                    setSearchError("Не удалось получить данные по серии");
                    return;
                }

                if (
                    installationPlace === "ON_UNWIND" &&
                    !canInstallAtUnwind(presenceRows, nextRow.nomenclatureCode, installationPlace)
                ) {
                    setSearchError("На размотке уже есть рулон этой номенклатуры. Выберите «Ожидание».");
                    return;
                }

                setPresenceRows((prev) => {
                    const nextRows = upsertPresenceRow(prev, nextRow);
                    setInstallationPlace(resolveDefaultInstallationPlace(nextRows));
                    return nextRows;
                });

                setBarcode("");
                setExpandedPresenceRowId(nextRow.id);

                if (mapped.stageRegistryRefreshHint) {
                    setStageRegistryRefreshKey((prev) => prev + 1);
                }
            } catch (error) {
                setSearchError(error instanceof Error ? error.message : "Не удалось зарегистрировать серию");
            } finally {
                setIsSearching(false);
            }
        },
        [installationPlace, presenceRows, workAreaId],
    );

    const search = useCallback(async () => {
        await searchByBarcode(barcode);
    }, [barcode, searchByBarcode]);

    const stageRegistry = useMaterialsWriteoffStageRegistry({
        workAreaId,
        enabled,
        refreshKey: stageRegistryRefreshKey,
    });

    const moveToUnwind = useCallback((rowId: string) => {
        setPresenceRows((prev) => movePresenceRowToUnwind(prev, rowId));
    }, []);

    const selectForWriteoff = useCallback((row: MaterialsPresenceRow) => {
        setSelectedWriteoffRoll(row);
        setWriteoffForm(buildWriteoffFormFromSelection(row, null));
        reset();
    }, [reset]);

    const updateWriteoffForm = useCallback(
        (patch: Partial<MaterialsWriteoffFormState>) => {
            setWriteoffForm((prev) => {
                const normalizedPatch = { ...patch };
                if ("meters" in normalizedPatch && typeof normalizedPatch.meters === "string") {
                    normalizedPatch.meters = sanitizeWriteoffMetersInput(normalizedPatch.meters);
                }
                if ("weight" in normalizedPatch && typeof normalizedPatch.weight === "string") {
                    normalizedPatch.weight = sanitizeWriteoffMetersInput(normalizedPatch.weight);
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
        const activeRoll = selectedWriteoffRoll;

        if (!trimmedWorkAreaId) {
            setReflectReturnError("Не удалось определить workAreaId этапа");
            return;
        }

        if (!activeRoll?.barcode.trim()) {
            setReflectReturnError("Выберите рулон кнопкой «Списать»");
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
                        barcode: activeRoll.barcode,
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
            setPresenceRows((prev) => removePresenceRow(prev, activeRoll.id));
            resetWriteoffSelection();
        } catch (error) {
            setReflectReturnError(error instanceof Error ? error.message : "Не удалось отразить возврат");
        } finally {
            setIsReflectingReturn(false);
        }
    }, [resetWriteoffSelection, selectedWriteoffRoll, workAreaId, writeoffForm.meters, writeoffForm.weight, writeoffForm.warehouse]);

    const writeOffMaterialFully = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        const warehouse = writeoffForm.warehouse.trim();
        const activeRoll = selectedWriteoffRoll;

        if (!trimmedWorkAreaId) {
            setWriteOffFullyError("Не удалось определить workAreaId этапа");
            return;
        }

        if (!activeRoll?.barcode.trim()) {
            setWriteOffFullyError("Выберите рулон кнопкой «Списать»");
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
                        barcode: activeRoll.barcode,
                        warehouse,
                    },
                ],
            });
            const result = mapRegisterMaterialFullWriteoffPayload(payload);
            if (result.stageRegistryRefreshHint) {
                setStageRegistryRefreshKey((prev) => prev + 1);
            }
            setPresenceRows((prev) => removePresenceRow(prev, activeRoll.id));
            resetWriteoffSelection();
        } catch (error) {
            setWriteOffFullyError(error instanceof Error ? error.message : "Не удалось списать материал полностью");
        } finally {
            setIsWritingOffFully(false);
        }
    }, [resetWriteoffSelection, selectedWriteoffRoll, workAreaId, writeoffForm.warehouse]);

    const canCalculateWeight = canCalculateWriteoffWeight(writeoffForm.meters);
    const isWriteoffActionInProgress = isReflectingReturn || isWritingOffFully;
    const isReflectReturnEnabled = isMaterialsWriteoffFormReady(writeoffForm) && !isWriteoffActionInProgress;
    const isFullWriteoffEnabled = isMaterialFullWriteoffReady(writeoffForm) && !isWriteoffActionInProgress;
    const isWriteoffActionsEnabled = isMaterialsWriteoffFormReady(writeoffForm) && !isWriteoffActionInProgress;

    return {
        barcode,
        setBarcode,
        installationPlace,
        setInstallationPlace,
        installationPlaceOptions: MATERIALS_INSTALLATION_PLACE_OPTIONS,
        presenceRows,
        expandedPresenceRowId,
        setExpandedPresenceRowId,
        selectedWriteoffRoll,
        scanBanner,
        writeoffForm,
        updateWriteoffForm,
        calculateWriteoffWeight,
        reflectMaterialReturn,
        writeOffMaterialFully,
        moveToUnwind,
        selectForWriteoff,
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
        searchError,
        expandedOpId,
        setExpandedOpId,
        search,
        canSearch: Boolean(workAreaId?.trim()) && !isSearching,
    };
}
