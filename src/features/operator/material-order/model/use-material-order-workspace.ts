import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ApiSchemas } from "@/shared/api/schema";
import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import {
    MATERIAL_ORDER_RESOURCE_CODE,
    NOMENCLATURE_KIND_OPTIONS,
} from "./constants";
import { buildMaterialOrderLocationRequestBody } from "./build-material-order-location-request-body";
import {
    buildMaterialOrderSubmitBlockBody,
    collectMaterialOrderBlockSeriesRefs,
} from "./build-material-order-submit-block-body";
import { buildMaterialOrderSubmitBody, formatMaterialOrderDateTimeLocalNow } from "./build-material-order-submit-body";
import {
    type MaterialOrderLine,
    type LocationRow,
    type RollPickRow,
} from "./material-order-workspace-mock";
import { mapMaterialOrderComposePayload } from "./map-material-order-compose-payload";
import { mapMaterialOrderLocationPayload } from "./map-material-order-location-payload";
import { mapMaterialOrderLocationRollLabelPayload } from "./map-material-order-location-roll-label-payload";
import { mapMaterialOrderSubmitBlockPayload } from "./map-material-order-submit-block-payload";
import { mapMaterialOrderPickCandidatesPayload } from "./map-material-order-pick-candidates-payload";
import {
    mapMaterialOrderSubmitPayload,
    type MaterialOrderSubmitStatus,
} from "./map-material-order-submit-payload";
import { useMaterialOrderBlockReasons } from "./use-material-order-block-reasons";
import { useMaterialOrderMachineOptions } from "./use-material-order-machine-options";
import { useMaterialOrderPlanStages } from "./use-material-order-plan-stages";
import {
    pickDefaultMaterialOrderMachineCodes,
    toggleMaterialOrderMachineSelection,
} from "./material-order-location-machine-selection";
import type { MaterialOrderPlanStage, NomenclatureKindId } from "./types";

function normalizeSearch(q: string) {
    return q.trim().toLowerCase();
}

function planMatchesSearch(row: MaterialOrderPlanStage, q: string) {
    if (!q) return true;
    const n = normalizeSearch(q);
    return (
        row.stage.toLowerCase().includes(n) ||
        row.orderId.toLowerCase().includes(n) ||
        row.client.toLowerCase().includes(n) ||
        row.product.toLowerCase().includes(n)
    );
}

function materialMatchesSearch(row: MaterialOrderLine, q: string) {
    if (!q) return true;
    const n = normalizeSearch(q);
    return (
        row.nomenclature.toLowerCase().includes(n) ||
        row.nomenclatureName.toLowerCase().includes(n)
    );
}

function rollMatchesSearch(row: RollPickRow, q: string) {
    if (!q) return true;
    const n = normalizeSearch(q);
    return row.nomenclature.toLowerCase().includes(n) || row.series.toLowerCase().includes(n);
}

function locationMatchesSearch(row: LocationRow, q: string) {
    if (!q) return true;
    const n = normalizeSearch(q);
    return (
        row.nomenclature.toLowerCase().includes(n) ||
        row.series.toLowerCase().includes(n) ||
        row.kindLabel.toLowerCase().includes(n) ||
        row.machineId.toLowerCase().includes(n)
    );
}

const defaultLocationKinds = NOMENCLATURE_KIND_OPTIONS.map((k) => k.id);

function byKindOrder(a: NomenclatureKindId, b: NomenclatureKindId) {
    return (
        NOMENCLATURE_KIND_OPTIONS.findIndex((k) => k.id === a) -
        NOMENCLATURE_KIND_OPTIONS.findIndex((k) => k.id === b)
    );
}

export function useMaterialOrderWorkspace() {
    const planStages = useMaterialOrderPlanStages(MATERIAL_ORDER_RESOURCE_CODE);
    const {
        machineOptions,
        isLoading: isMachineOptionsLoading,
        error: machineOptionsError,
        reload: reloadMachineOptions,
    } = useMaterialOrderMachineOptions();
    const blockReasonsState = useMaterialOrderBlockReasons();

    const { mutateAsync: composeMaterialOrderLines } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.composeMaterialOrderLines,
        {},
    );
    const composeMaterialOrderLinesRef = useRef(composeMaterialOrderLines);
    composeMaterialOrderLinesRef.current = composeMaterialOrderLines;

    const { mutateAsync: listMaterialOrderPickCandidates } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.listMaterialOrderPickCandidates,
        {},
    );
    const listMaterialOrderPickCandidatesRef = useRef(listMaterialOrderPickCandidates);
    listMaterialOrderPickCandidatesRef.current = listMaterialOrderPickCandidates;

    const { mutateAsync: submitMaterialOrderRequest } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.submitMaterialOrderRequest,
        {},
    );
    const submitMaterialOrderRequestRef = useRef(submitMaterialOrderRequest);
    submitMaterialOrderRequestRef.current = submitMaterialOrderRequest;

    const { mutateAsync: getMachineMaterialLocation } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getMachineMaterialLocation,
        {},
    );
    const getMachineMaterialLocationRef = useRef(getMachineMaterialLocation);
    getMachineMaterialLocationRef.current = getMachineMaterialLocation;

    const { mutateAsync: reprintRollLabelBySeries } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.reprintRollLabelBySeries,
        {},
    );
    const reprintRollLabelBySeriesRef = useRef(reprintRollLabelBySeries);
    reprintRollLabelBySeriesRef.current = reprintRollLabelBySeries;

    const { mutateAsync: submitBlockRequest } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.submitBlockRequest,
        {},
    );
    const submitBlockRequestRef = useRef(submitBlockRequest);
    submitBlockRequestRef.current = submitBlockRequest;

    const [planQuery, setPlanQuery] = useState("");
    const [planSelectedIds, setPlanSelectedIds] = useState<Set<string>>(() => new Set());
    const [isOrderFormVisible, setIsOrderFormVisible] = useState(false);
    const [composeError, setComposeError] = useState<string | null>(null);
    const [isComposing, setIsComposing] = useState(false);

    const [materialQuery, setMaterialQuery] = useState("");
    const [materialLines, setMaterialLines] = useState<MaterialOrderLine[]>([]);
    const [composeResultLines, setComposeResultLines] = useState<
        ApiSchemas["MaterialOrderComposeLineResultItem"][]
    >([]);
    const [materialChangeEnabled, setMaterialChangeEnabled] = useState(false);
    const [rollsQuery, setRollsQuery] = useState("");
    const [pickToggleEnabled, setPickToggleEnabled] = useState(false);
    const [specificRollsEnabled, setSpecificRollsEnabled] = useState(false);
    const [orderWorkAreaIds, setOrderWorkAreaIds] = useState("");
    const [rollPicks, setRollPicks] = useState<RollPickRow[]>([]);
    const [rollsLoading, setRollsLoading] = useState(false);
    const [rollsError, setRollsError] = useState<string | null>(null);
    const [selectedRollIds, setSelectedRollIds] = useState<Set<string>>(() => new Set());
    const [byTime, setByTime] = useState(() => formatMaterialOrderDateTimeLocalNow());
    const [warehouseComment, setWarehouseComment] = useState("");
    const [isAddingToOrder, setIsAddingToOrder] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitStatus, setSubmitStatus] = useState<MaterialOrderSubmitStatus | null>(null);

    const [locationFilterMachines, setLocationFilterMachines] = useState<string[]>([]);
    const [locationFilterKinds, setLocationFilterKinds] = useState<NomenclatureKindId[]>(defaultLocationKinds);
    const [locationRows, setLocationRows] = useState<LocationRow[]>([]);
    const [locationAsOf, setLocationAsOf] = useState("");
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [printingLocationSeriesRef, setPrintingLocationSeriesRef] = useState<string | null>(null);
    const [locationPrintError, setLocationPrintError] = useState<string | null>(null);
    const [locationQuery, setLocationQuery] = useState("");
    const [locationSelectedIds, setLocationSelectedIds] = useState<Set<string>>(() => new Set());
    const [selectedBlockReasonCode, setSelectedBlockReasonCode] = useState<string | null>(null);
    const [blockComment, setBlockComment] = useState("");
    const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);
    const [blockSubmitError, setBlockSubmitError] = useState<string | null>(null);
    const [blockSubmitMessage, setBlockSubmitMessage] = useState<string | null>(null);

    const hasAutoLoadedLocationRef = useRef(false);

    const selectedBlockSeriesRefs = useMemo(
        () => collectMaterialOrderBlockSeriesRefs(locationRows, locationSelectedIds),
        [locationRows, locationSelectedIds],
    );

    const primaryOrderWorkAreaId = useMemo(
        () => orderWorkAreaIds.split(",")[0]?.trim() ?? "",
        [orderWorkAreaIds],
    );

    useEffect(() => {
        if (machineOptions.length === 0) {
            return;
        }

        setLocationFilterMachines((prev) => pickDefaultMaterialOrderMachineCodes(machineOptions, prev));
    }, [machineOptions]);

    const planRowsFiltered = useMemo(
        () => planStages.stages.filter((row) => planMatchesSearch(row, planQuery)),
        [planQuery, planStages.stages],
    );

    const materialLinesFiltered = useMemo(
        () => materialLines.filter((row) => materialMatchesSearch(row, materialQuery)),
        [materialLines, materialQuery],
    );

    const rollsFiltered = useMemo(
        () => rollPicks.filter((row) => rollMatchesSearch(row, rollsQuery)),
        [rollPicks, rollsQuery],
    );

    const locationRowsFiltered = useMemo(
        () => locationRows.filter((row) => locationMatchesSearch(row, locationQuery)),
        [locationQuery, locationRows],
    );

    const refreshLocation = useCallback(async () => {
        if (locationFilterMachines.length === 0) {
            setLocationError("Выберите хотя бы одну машину");
            return;
        }

        setLocationLoading(true);
        setLocationError(null);

        try {
            const body = buildMaterialOrderLocationRequestBody({
                resourceIds: locationFilterMachines,
                kindFilters: locationFilterKinds,
            });
            const payload = await getMachineMaterialLocationRef.current({ body });
            const mapped = mapMaterialOrderLocationPayload(payload);

            setLocationRows(mapped.rows);
            setLocationAsOf(mapped.asOf);
            setLocationSelectedIds((prev) => {
                const validIds = new Set(mapped.rows.map((row) => row.id));
                const next = new Set([...prev].filter((id) => validIds.has(id)));
                return next;
            });
        } catch (loadError) {
            setLocationError(loadError instanceof Error ? loadError.message : "Не удалось загрузить локацию");
        } finally {
            setLocationLoading(false);
        }
    }, [locationFilterKinds, locationFilterMachines]);

    useEffect(() => {
        if (isMachineOptionsLoading || machineOptions.length === 0 || locationFilterMachines.length === 0) {
            return;
        }

        if (hasAutoLoadedLocationRef.current) {
            return;
        }

        hasAutoLoadedLocationRef.current = true;
        void refreshLocation();
    }, [isMachineOptionsLoading, locationFilterMachines, machineOptions.length, refreshLocation]);

    const printLocationRollLabel = useCallback(async (seriesRef: string) => {
        if (seriesRef === "") {
            setLocationPrintError("Не указана серия для печати");
            return;
        }

        setPrintingLocationSeriesRef(seriesRef);
        setLocationPrintError(null);

        try {
            const payload = await reprintRollLabelBySeriesRef.current({
                body: [{ seriesRef }],
            });
            const previewFilePath = mapMaterialOrderLocationRollLabelPayload(payload);
            window.open(previewFilePath, "_blank", "noopener,noreferrer");
        } catch (printError) {
            setLocationPrintError(
                printError instanceof Error ? printError.message : "Не удалось напечатать этикетку",
            );
        } finally {
            setPrintingLocationSeriesRef(null);
        }
    }, []);

    const resetOrderDraft = useCallback(() => {
        setMaterialLines([]);
        setComposeResultLines([]);
        setWarehouseComment("");
        setByTime(formatMaterialOrderDateTimeLocalNow());
        setPickToggleEnabled(false);
        setSpecificRollsEnabled(false);
        setOrderWorkAreaIds("");
        setRollPicks([]);
        setRollsLoading(false);
        setRollsError(null);
        setSelectedRollIds(new Set());
        setMaterialChangeEnabled(false);
        setSubmitError(null);
        setSubmitStatus(null);
        setIsOrderFormVisible(false);
        setComposeError(null);
        setPlanSelectedIds(new Set());
    }, []);

    const togglePlanRow = useCallback((id: string) => {
        setPlanSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
        setComposeError(null);
    }, []);

    const composeOrder = useCallback(async () => {
        if (planSelectedIds.size === 0) {
            setComposeError("Выберите хотя бы один этап");
            return;
        }

        const workAreaIds = planStages.stages
            .filter((stage) => planSelectedIds.has(stage.workAreaId))
            .map((stage) => stage.workAreaId)
            .join(",");

        if (!workAreaIds) {
            setComposeError("Выберите хотя бы один этап");
            return;
        }

        setIsComposing(true);
        setComposeError(null);
        setSubmitError(null);
        setSubmitStatus(null);

        try {
            const payload = await composeMaterialOrderLinesRef.current({
                body: [{ workAreaIds }],
            });
            const mapped = mapMaterialOrderComposePayload(payload);

            setComposeResultLines([...(payload?.[0]?.result ?? [])]);
            setMaterialLines(mapped.lines);
            setPickToggleEnabled(mapped.pickToggleEnabled);
            setSpecificRollsEnabled(false);
            setOrderWorkAreaIds(workAreaIds);
            setRollPicks([]);
            setRollsError(null);
            setSelectedRollIds(new Set());
            setIsOrderFormVisible(true);
        } catch (composeLoadError) {
            setComposeError(
                composeLoadError instanceof Error ? composeLoadError.message : "Не удалось сформировать заказ",
            );
        } finally {
            setIsComposing(false);
        }
    }, [planSelectedIds, planStages.stages]);

    const setLineQty = useCallback((id: string, qty: number) => {
        setMaterialLines((rows) => rows.map((r) => (r.id === id ? { ...r, requestedQty: qty } : r)));
    }, []);

    const clearMaterialSearch = useCallback(() => {
        setMaterialQuery("");
    }, []);

    const handleSpecificRollsChange = useCallback(
        async (checked: boolean) => {
            setSpecificRollsEnabled(checked);
            setSelectedRollIds(new Set());
            setRollsError(null);

            if (!checked) {
                setRollPicks([]);
                setRollsLoading(false);
                return;
            }

            const workAreaId = primaryOrderWorkAreaId;
            if (!workAreaId) {
                setRollsError("Не удалось определить workAreaId этапа");
                setSpecificRollsEnabled(false);
                return;
            }

            setRollsLoading(true);
            try {
                const payload = await listMaterialOrderPickCandidatesRef.current({
                    body: [{ workAreaId }],
                });
                setRollPicks(mapMaterialOrderPickCandidatesPayload(payload));
            } catch (loadError) {
                setRollPicks([]);
                setRollsError(loadError instanceof Error ? loadError.message : "Не удалось загрузить рулоны");
                setSpecificRollsEnabled(false);
            } finally {
                setRollsLoading(false);
            }
        },
        [primaryOrderWorkAreaId],
    );

    const toggleRoll = useCallback((id: string) => {
        const row = rollPicks.find((pick) => pick.id === id);
        if (row?.blocked) {
            return;
        }

        setSelectedRollIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, [rollPicks]);

    const addToOrder = useCallback(async () => {
        setIsAddingToOrder(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 400));
        } finally {
            setIsAddingToOrder(false);
        }
    }, []);

    const submitOrder = useCallback(async () => {
        const workAreaIds = orderWorkAreaIds.trim();
        if (!workAreaIds) {
            setSubmitError("Сначала сформируйте заказ");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const body = buildMaterialOrderSubmitBody({
                workAreaIds,
                composeLines: composeResultLines,
                materialLines,
                rollPicks,
                selectedRollIds,
                byTime,
                warehouseComment,
                materialChangeEnabled,
            });
            const payload = await submitMaterialOrderRequestRef.current({ body });
            const status = mapMaterialOrderSubmitPayload(payload);
            if (status.visible) {
                setSubmitStatus(status);
            }
        } catch (submitLoadError) {
            setSubmitError(
                submitLoadError instanceof Error ? submitLoadError.message : "Не удалось отправить заявку",
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [
        byTime,
        composeResultLines,
        materialChangeEnabled,
        materialLines,
        orderWorkAreaIds,
        rollPicks,
        selectedRollIds,
        warehouseComment,
    ]);

    const toggleLocationMachine = useCallback(
        (resourceCode: string) => {
            setLocationFilterMachines((prev) =>
                toggleMaterialOrderMachineSelection(machineOptions, prev, resourceCode),
            );
        },
        [machineOptions],
    );

    const toggleLocationKind = useCallback((id: NomenclatureKindId) => {
        setLocationFilterKinds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].sort(byKindOrder),
        );
    }, []);

    const clearLocationKinds = useCallback(() => {
        setLocationFilterKinds([]);
    }, []);

    const toggleLocationRow = useCallback((id: string) => {
        const row = locationRows.find((item) => item.id === id);
        if (row?.rowSelectable === false) {
            return;
        }

        setLocationSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, [locationRows]);

    const selectBlockReason = useCallback((code: string | null) => {
        setSelectedBlockReasonCode(code);
        setBlockSubmitError(null);
        setBlockSubmitMessage(null);
    }, []);

    const submitBlock = useCallback(async () => {
        const reasonCode = selectedBlockReasonCode?.trim();
        if (!reasonCode) {
            setBlockSubmitError("Выберите причину блокировки");
            return;
        }

        if (selectedBlockSeriesRefs.length === 0) {
            setBlockSubmitError("Выберите строки локации с непустой серией");
            return;
        }

        setIsSubmittingBlock(true);
        setBlockSubmitError(null);
        setBlockSubmitMessage(null);

        try {
            const body = buildMaterialOrderSubmitBlockBody({
                locationRows,
                locationSelectedIds,
                reasonCode,
                comment: blockComment,
            });
            const payload = await submitBlockRequestRef.current({ body });
            const result = mapMaterialOrderSubmitBlockPayload(payload);
            setBlockSubmitMessage(result.message);
            setLocationSelectedIds(new Set());
            setBlockComment("");
            setSelectedBlockReasonCode(null);
        } catch (submitBlockError) {
            setBlockSubmitError(
                submitBlockError instanceof Error
                    ? submitBlockError.message
                    : "Не удалось передать блокировку",
            );
        } finally {
            setIsSubmittingBlock(false);
        }
    }, [
        blockComment,
        locationRows,
        locationSelectedIds,
        selectedBlockReasonCode,
        selectedBlockSeriesRefs.length,
    ]);

    return {
        orderMachineId: planStages.resourceCode,
        planStagesLoading: planStages.isLoading,
        planStagesError: planStages.error,
        reloadPlanStages: planStages.reload,
        machineOptions,
        isMachineOptionsLoading,
        machineOptionsError,
        reloadMachineOptions,
        nomenclatureOptions: NOMENCLATURE_KIND_OPTIONS,
        planQuery,
        setPlanQuery,
        planRowsFiltered,
        planSelectedIds,
        togglePlanRow,
        isOrderFormVisible,
        composeError,
        isComposing,
        composeOrder,
        materialQuery,
        setMaterialQuery,
        materialLines,
        materialLinesFiltered,
        materialChangeEnabled,
        setMaterialChangeEnabled,
        setLineQty,
        resetOrderDraft,
        clearMaterialSearch,
        rollsQuery,
        setRollsQuery,
        rollsFiltered,
        pickToggleEnabled,
        specificRollsEnabled,
        handleSpecificRollsChange,
        rollsLoading,
        rollsError,
        selectedRollIds,
        toggleRoll,
        byTime,
        setByTime,
        warehouseComment,
        setWarehouseComment,
        isAddingToOrder,
        addToOrder,
        isSubmitting,
        submitError,
        submitStatus,
        submitOrder,
        locationFilterMachines,
        locationFilterKinds,
        locationRows,
        locationAsOf,
        locationLoading,
        locationError,
        locationPrintError,
        printingLocationSeriesRef,
        refreshLocation,
        printLocationRollLabel,
        toggleLocationMachine,
        toggleLocationKind,
        clearLocationKinds,
        locationQuery,
        setLocationQuery,
        locationRowsFiltered,
        locationSelectedIds,
        toggleLocationRow,
        selectedBlockReasonCode,
        selectBlockReason,
        blockComment,
        setBlockComment,
        selectedBlockSeriesRefs,
        isSubmittingBlock,
        blockSubmitError,
        blockSubmitMessage,
        submitBlock,
        blockReasons: blockReasonsState.blockReasons,
        blockReasonsLoading: blockReasonsState.isLoading,
        blockReasonsError: blockReasonsState.error,
        reloadBlockReasons: blockReasonsState.reload,
    };
}

export type MaterialOrderWorkspaceModel = ReturnType<typeof useMaterialOrderWorkspace>;
