import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useSession } from "@/shared/model/session";

import { buildResolveBarcodeOnStageBody } from "./build-resolve-barcode-on-stage-body";
import { buildSubmitFullWriteOffBody } from "./build-submit-full-write-off-body";
import { buildSubmitMoveToUnwindBody } from "./build-submit-move-to-unwind-body";
import { buildSubmitPartialReturnBody } from "./build-submit-partial-return-body";
import { buildSubmitStageLkmBody } from "./build-submit-stage-lkm-body";
import { mapResolveBarcodeOnStagePayload } from "./map-resolve-barcode-on-stage-payload";
import { mapSubmitFullWriteOffPayload } from "./map-submit-full-write-off-payload";
import { mapSubmitMoveToUnwindPayload } from "./map-submit-move-to-unwind-payload";
import { mapSubmitPartialReturnPayload } from "./map-submit-partial-return-payload";
import { mapSubmitStageLkmPayload } from "./map-submit-stage-lkm-payload";
import {
    resolveDefaultInstallationPlace,
} from "./materials-presence-rules";
import {
    canCalculateWriteoffWeight,
    DEFAULT_MATERIALS_INSTALLATION_PLACE,
    EMPTY_MATERIALS_WRITEOFF_FORM,
    isMaterialsWriteoffFormReady,
    parseWriteoffLength,
    parseWriteoffWeight,
    resolveInstallationPlaceOptions,
    sanitizeWriteoffMetersInput,
    type MaterialsInstallationPlace,
} from "./materials-writeoff-form";
import type { MaterialsWriteoffFormState } from "./materials-writeoff-form";
import { resolveMaterialsWriteoffOperatorRef } from "./resolve-materials-writeoff-operator-ref";
import { useMaterialsWriteoffReturnWarehouses } from "./use-materials-writeoff-return-warehouses";
import { useMaterialsWriteoffRollPresence } from "./use-materials-writeoff-roll-presence";
import { useMaterialsWriteoffStageRegistry } from "./use-materials-writeoff-stage-registry";
import { useMaterialsWriteoffWeight } from "./use-materials-writeoff-weight";
import type { MaterialsPresenceRow, MaterialsReturnWarehouseOption } from "./types";

type ScanBannerState = {
    stageSpecBannerVisible: boolean;
    stageSpecBannerTitle: string;
    stageSpecBannerDetail: string;
};

type UseMaterialsWriteoffOptions = {
    workAreaId?: string;
    enabled?: boolean;
    /** После успешного возврата/полного списания — silent-reload мониторинга (summary + roll tables) */
    onMonitoringSummaryReload?: () => void;
};

function buildWriteoffFormFromSelection(
    row: MaterialsPresenceRow,
    warehouseOptions: MaterialsReturnWarehouseOption[],
): MaterialsWriteoffFormState {
    const metersFromRow = row.currentLengthM > 0 ? String(row.currentLengthM) : "";
    const weightFromRow = row.currentWeightKg > 0 ? String(row.currentWeightKg) : "";

    return {
        meters: metersFromRow,
        weight: weightFromRow,
        warehouse: warehouseOptions[0]?.warehouseCode ?? "",
    };
}

function resolveDefaultWarehouse(
    currentWarehouse: string,
    warehouseOptions: MaterialsReturnWarehouseOption[],
): string {
    const trimmedCurrent = currentWarehouse.trim();
    if (
        trimmedCurrent &&
        warehouseOptions.some((option) => option.warehouseCode === trimmedCurrent)
    ) {
        return trimmedCurrent;
    }

    return warehouseOptions[0]?.warehouseCode ?? "";
}

export function useMaterialsWriteoff({
    workAreaId,
    enabled = true,
    onMonitoringSummaryReload,
}: UseMaterialsWriteoffOptions) {
    const { session } = useSession();
    const operatorRef = resolveMaterialsWriteoffOperatorRef(session);
    const onMonitoringSummaryReloadRef = useRef(onMonitoringSummaryReload);
    onMonitoringSummaryReloadRef.current = onMonitoringSummaryReload;
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
    const [expandedOpIds, setExpandedOpIds] = useState<ReadonlySet<string>>(() => new Set());
    const [presenceRefreshKey, setPresenceRefreshKey] = useState(0);
    const [stageRegistryRefreshKey, setStageRegistryRefreshKey] = useState(0);
    const [writeoffForm, setWriteoffForm] = useState<MaterialsWriteoffFormState>(EMPTY_MATERIALS_WRITEOFF_FORM);
    const [isReflectingReturn, setIsReflectingReturn] = useState(false);
    const [reflectReturnError, setReflectReturnError] = useState<string | null>(null);
    const [isWritingOffFully, setIsWritingOffFully] = useState(false);
    const [writeOffFullyError, setWriteOffFullyError] = useState<string | null>(null);
    const [isSubmittingStageLkm, setIsSubmittingStageLkm] = useState(false);
    const [submitStageLkmError, setSubmitStageLkmError] = useState<string | null>(null);
    const [movingToUnwindRowId, setMovingToUnwindRowId] = useState<string | null>(null);
    const [moveToUnwindError, setMoveToUnwindError] = useState<string | null>(null);

    const { mutateAsync: resolveBarcodeOnStage } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.resolveBarcodeOnStage,
        {},
    );

    const resolveBarcodeOnStageRef = useRef(resolveBarcodeOnStage);
    resolveBarcodeOnStageRef.current = resolveBarcodeOnStage;

    const { mutateAsync: submitMoveToUnwind } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.submitMoveToUnwind,
        {},
    );

    const submitMoveToUnwindRef = useRef(submitMoveToUnwind);
    submitMoveToUnwindRef.current = submitMoveToUnwind;

    const { mutateAsync: submitPartialReturn } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.submitPartialReturn,
        {},
    );

    const submitPartialReturnRef = useRef(submitPartialReturn);
    submitPartialReturnRef.current = submitPartialReturn;

    const { mutateAsync: submitFullWriteOff } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.submitFullWriteOff,
        {},
    );

    const submitFullWriteOffRef = useRef(submitFullWriteOff);
    submitFullWriteOffRef.current = submitFullWriteOff;

    const { mutateAsync: submitStageLkm } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.submitStageLkm,
        {},
    );

    const submitStageLkmRef = useRef(submitStageLkm);
    submitStageLkmRef.current = submitStageLkm;

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
            setMoveToUnwindError(null);
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

            const operatorRef = resolveMaterialsWriteoffOperatorRef(session);
            if (!operatorRef) {
                setSearchError("Не удалось определить оператора");
                return;
            }

            if (
                installationPlace === "ON_UNWIND" &&
                resolveInstallationPlaceOptions(presenceRows).find((option) => option.value === "ON_UNWIND")?.disabled
            ) {
                setSearchError("На размотке уже есть рулон. Выберите «Ожидание».");
                return;
            }

            setIsSearching(true);
            setSearchError(null);
            setScanBanner(null);

            try {
                const payload = await resolveBarcodeOnStageRef.current({
                    body: buildResolveBarcodeOnStageBody({
                        workAreaId: trimmedWorkAreaId,
                        barcode: barcodeValue,
                        installationPlace,
                        operatorRef,
                    }),
                });
                const mapped = mapResolveBarcodeOnStagePayload(payload);

                if (
                    mapped.stageSpecBannerVisible ||
                    (mapped.scanBlockedByActiveInput && installationPlace === "ON_UNWIND")
                ) {
                    setScanBanner({
                        stageSpecBannerVisible: true,
                        stageSpecBannerTitle: mapped.stageSpecBannerTitle || "Внимание",
                        stageSpecBannerDetail: mapped.stageSpecBannerDetail || "",
                    });
                    return;
                }

                setBarcode("");
                setExpandedPresenceRowId(mapped.materialRollId || null);
                setPresenceRefreshKey((prev) => prev + 1);
                setStageRegistryRefreshKey((prev) => prev + 1);
            } catch (error) {
                setSearchError(error instanceof Error ? error.message : "Не удалось зарегистрировать серию");
            } finally {
                setIsSearching(false);
            }
        },
        [installationPlace, presenceRows, session, workAreaId],
    );

    const toggleExpandedOpId = useCallback((opId: string) => {
        setExpandedOpIds((prev) => {
            const next = new Set(prev);
            if (next.has(opId)) {
                next.delete(opId);
            } else {
                next.add(opId);
            }
            return next;
        });
    }, []);

    const search = useCallback(async () => {
        await searchByBarcode(barcode);
    }, [barcode, searchByBarcode]);

    const stageRegistry = useMaterialsWriteoffStageRegistry({
        workAreaId,
        enabled,
        refreshKey: stageRegistryRefreshKey,
    });

    const rollPresence = useMaterialsWriteoffRollPresence({
        workAreaId,
        enabled,
        refreshKey: presenceRefreshKey,
    });

    const returnWarehouses = useMaterialsWriteoffReturnWarehouses({
        workAreaId,
        operatorRef,
        enabled,
    });

    useEffect(() => {
        if (!enabled) {
            return;
        }

        setPresenceRows(rollPresence.rows);
    }, [enabled, rollPresence.rows]);

    useEffect(() => {
        if (!enabled || rollPresence.isLoading) {
            return;
        }

        setInstallationPlace(resolveDefaultInstallationPlace(rollPresence.rows));
    }, [enabled, rollPresence.isLoading, rollPresence.rows]);

    const installationPlaceOptions = useMemo(
        () => resolveInstallationPlaceOptions(presenceRows),
        [presenceRows],
    );

    const refreshWriteoffTables = useCallback(async () => {
        await rollPresence.reload();
        setStageRegistryRefreshKey((prev) => prev + 1);
    }, [rollPresence]);

    useEffect(() => {
        const selectedOption = installationPlaceOptions.find((option) => option.value === installationPlace);
        if (selectedOption?.disabled) {
            setInstallationPlace("WAITING");
        }
    }, [installationPlace, installationPlaceOptions]);

    const moveToUnwind = useCallback(
        async (rowId: string) => {
            const target = presenceRows.find((row) => row.id === rowId);
            if (!target || !target.canMoveToUnwind || target.status !== "WAITING") {
                return;
            }

            const trimmedWorkAreaId = workAreaId?.trim();
            if (!trimmedWorkAreaId) {
                setMoveToUnwindError("Не удалось определить workAreaId этапа");
                return;
            }

            const materialRollId = target.materialRollId.trim();
            const barcodeValue = target.barcode.trim();
            if (!materialRollId || !barcodeValue) {
                setMoveToUnwindError("Не удалось определить рулон для перемещения");
                return;
            }

            const operatorRef = resolveMaterialsWriteoffOperatorRef(session);
            if (!operatorRef) {
                setMoveToUnwindError("Не удалось определить оператора");
                return;
            }

            setMovingToUnwindRowId(rowId);
            setMoveToUnwindError(null);

            try {
                const payload = await submitMoveToUnwindRef.current({
                    body: buildSubmitMoveToUnwindBody({
                        workAreaId: trimmedWorkAreaId,
                        materialRollId,
                        barcode: barcodeValue,
                        operatorRef,
                    }),
                });
                mapSubmitMoveToUnwindPayload(payload);
                await refreshWriteoffTables();
            } catch (error) {
                setMoveToUnwindError(
                    error instanceof Error ? error.message : "Не удалось переместить рулон на размотку",
                );
            } finally {
                setMovingToUnwindRowId(null);
            }
        },
        [presenceRows, refreshWriteoffTables, session, workAreaId],
    );

    const selectForWriteoff = useCallback(
        (row: MaterialsPresenceRow) => {
            setSelectedWriteoffRoll(row);
            setWriteoffForm(buildWriteoffFormFromSelection(row, returnWarehouses.warehouseOptions));
            reset();
        },
        [reset, returnWarehouses.warehouseOptions],
    );

    const applyRawEventPrefill = useCallback(
        (prefill: {
            lengthM: number | null;
            weightKg: number | null;
            materialRollId: string;
            barcode: string;
        }) => {
            const materialRollId = prefill.materialRollId.trim();
            const barcode = prefill.barcode.trim();
            const matchedRoll =
                presenceRows.find(
                    (row) =>
                        (materialRollId && row.materialRollId.trim() === materialRollId) ||
                        (barcode && row.barcode.trim() === barcode),
                ) ?? null;

            if (matchedRoll) {
                setSelectedWriteoffRoll(matchedRoll);
            }

            setWriteoffForm((prev) => ({
                ...prev,
                meters:
                    prefill.lengthM != null
                        ? sanitizeWriteoffMetersInput(String(prefill.lengthM))
                        : prev.meters,
                weight: prefill.weightKg != null ? String(prefill.weightKg) : prev.weight,
                warehouse: resolveDefaultWarehouse(prev.warehouse, returnWarehouses.warehouseOptions),
            }));
            reset();
        },
        [presenceRows, reset, returnWarehouses.warehouseOptions],
    );

    useEffect(() => {
        if (!showWriteoffFlow) {
            return;
        }

        setWriteoffForm((prev) => {
            const nextWarehouse = resolveDefaultWarehouse(prev.warehouse, returnWarehouses.warehouseOptions);
            if (nextWarehouse === prev.warehouse) {
                return prev;
            }

            return {
                ...prev,
                warehouse: nextWarehouse,
            };
        });
    }, [returnWarehouses.warehouseOptions, showWriteoffFlow]);

    const updateWriteoffForm = useCallback(
        (patch: Partial<MaterialsWriteoffFormState>) => {
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
        const barcode = selectedWriteoffRoll?.barcode ?? "";
        const weight = await calculate(writeoffForm.meters, barcode);
        setWriteoffForm((prev) => ({
            ...prev,
            weight: weight ?? "",
        }));
    }, [calculate, selectedWriteoffRoll?.barcode, writeoffForm.meters]);

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

        const materialRollId = activeRoll.materialRollId.trim();
        if (!materialRollId) {
            setReflectReturnError("Не удалось определить рулон для возврата");
            return;
        }

        const operatorRefValue = resolveMaterialsWriteoffOperatorRef(session);
        if (!operatorRefValue) {
            setReflectReturnError("Не удалось определить оператора");
            return;
        }

        if (length === null || weight === null || !warehouse) {
            setReflectReturnError("Заполните метраж, вес и склад");
            return;
        }

        setIsReflectingReturn(true);
        setReflectReturnError(null);

        try {
            const payload = await submitPartialReturnRef.current({
                body: buildSubmitPartialReturnBody({
                    workAreaId: trimmedWorkAreaId,
                    materialRollId,
                    barcode: activeRoll.barcode,
                    length,
                    weight,
                    warehouse,
                    operatorRef: operatorRefValue,
                }),
            });
            mapSubmitPartialReturnPayload(payload);
            await refreshWriteoffTables();
            onMonitoringSummaryReloadRef.current?.();
            resetWriteoffSelection();
        } catch (error) {
            setReflectReturnError(error instanceof Error ? error.message : "Не удалось отразить возврат");
        } finally {
            setIsReflectingReturn(false);
        }
    }, [
        refreshWriteoffTables,
        resetWriteoffSelection,
        selectedWriteoffRoll,
        session,
        workAreaId,
        writeoffForm.meters,
        writeoffForm.weight,
        writeoffForm.warehouse,
    ]);

    const writeOffMaterialFully = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        const activeRoll = selectedWriteoffRoll;

        if (!trimmedWorkAreaId) {
            setWriteOffFullyError("Не удалось определить workAreaId этапа");
            return;
        }

        if (!activeRoll?.barcode.trim()) {
            setWriteOffFullyError("Выберите рулон кнопкой «Списать»");
            return;
        }

        const materialRollId = activeRoll.materialRollId.trim();
        if (!materialRollId) {
            setWriteOffFullyError("Не удалось определить рулон для списания");
            return;
        }

        const operatorRefValue = resolveMaterialsWriteoffOperatorRef(session);
        if (!operatorRefValue) {
            setWriteOffFullyError("Не удалось определить оператора");
            return;
        }

        setIsWritingOffFully(true);
        setWriteOffFullyError(null);

        try {
            const payload = await submitFullWriteOffRef.current({
                body: buildSubmitFullWriteOffBody({
                    workAreaId: trimmedWorkAreaId,
                    materialRollId,
                    barcode: activeRoll.barcode,
                    operatorRef: operatorRefValue,
                }),
            });
            mapSubmitFullWriteOffPayload(payload);
            await refreshWriteoffTables();
            onMonitoringSummaryReloadRef.current?.();
            resetWriteoffSelection();
        } catch (error) {
            setWriteOffFullyError(error instanceof Error ? error.message : "Не удалось списать материал полностью");
        } finally {
            setIsWritingOffFully(false);
        }
    }, [refreshWriteoffTables, resetWriteoffSelection, selectedWriteoffRoll, session, workAreaId]);

    const submitStageLkmWriteoff = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            setSubmitStageLkmError("Не удалось определить workAreaId этапа");
            return;
        }

        const operatorRefValue = resolveMaterialsWriteoffOperatorRef(session);
        if (!operatorRefValue) {
            setSubmitStageLkmError("Не удалось определить оператора");
            return;
        }

        setIsSubmittingStageLkm(true);
        setSubmitStageLkmError(null);

        try {
            const payload = await submitStageLkmRef.current({
                body: buildSubmitStageLkmBody({
                    workAreaId: trimmedWorkAreaId,
                    operatorRef: operatorRefValue,
                }),
            });
            mapSubmitStageLkmPayload(payload);
        } catch (error) {
            setSubmitStageLkmError(
                error instanceof Error ? error.message : "Не удалось отразить списание по этапу",
            );
        } finally {
            setIsSubmittingStageLkm(false);
        }
    }, [session, workAreaId]);

    const canCalculateWeight =
        showWriteoffFlow &&
        canCalculateWriteoffWeight(writeoffForm.meters, selectedWriteoffRoll?.barcode);
    const isWriteoffFormComplete =
        Boolean(selectedWriteoffRoll) && isMaterialsWriteoffFormReady(writeoffForm);
    const isWriteoffActionInProgress = isReflectingReturn || isWritingOffFully || isSubmittingStageLkm;
    const isReflectReturnEnabled = isWriteoffFormComplete && !isWriteoffActionInProgress;
    const isFullWriteoffEnabled = isWriteoffFormComplete && !isWriteoffActionInProgress;
    const isWriteoffActionsEnabled = isWriteoffFormComplete && !isWriteoffActionInProgress;

    return {
        barcode,
        setBarcode,
        installationPlace,
        setInstallationPlace,
        installationPlaceOptions,
        presenceRows,
        isPresenceLoading: rollPresence.isLoading,
        presenceAsOf: rollPresence.asOf,
        presenceError: rollPresence.error,
        expandedPresenceRowId,
        setExpandedPresenceRowId,
        selectedWriteoffRoll,
        scanBanner,
        writeoffForm,
        updateWriteoffForm,
        calculateWriteoffWeight,
        reflectMaterialReturn,
        writeOffMaterialFully,
        submitStageLkmWriteoff,
        moveToUnwind,
        movingToUnwindRowId,
        moveToUnwindError,
        selectForWriteoff,
        applyRawEventPrefill,
        canCalculateWeight,
        isReflectReturnEnabled,
        isFullWriteoffEnabled,
        isWriteoffActionsEnabled,
        isReflectingReturn,
        isWritingOffFully,
        isSubmittingStageLkm,
        reflectReturnError,
        writeOffFullyError,
        submitStageLkmError,
        warehouseOptions: returnWarehouses.warehouseOptions,
        isWarehousesLoading: returnWarehouses.isLoading,
        warehousesError: returnWarehouses.error,
        writeoffWeightError,
        isWriteoffWeightLoading,
        showWriteoffFlow,
        stageRegistry,
        isSearching,
        searchError,
        expandedOpIds,
        toggleExpandedOpId,
        search,
        canSearch: Boolean(workAreaId?.trim()) && !isSearching,
        refreshWriteoffTables,
    };
}
