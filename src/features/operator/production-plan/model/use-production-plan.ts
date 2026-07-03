import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useSession } from "@/shared/model/session";

import { mapProductionPlanMachinesPayload } from "./map-production-plan-machines-payload";
import { mapProductionPlanPayload } from "./map-production-plan-payload";
import { assertProductionPlanStageActionSuccess } from "./map-production-plan-stage-action-response";
import {
    applyStageAction,
    productionPlanActionErrorMessage,
    type ApplyProductionPlanActionOptions,
    type ProductionPlanAction,
} from "./production-plan-stage-actions";
import type { ProductionPlanFilters, ProductionPlanMachine, ProductionStage } from "./types";

export type ProductionPlanDataStatus = "idle" | "ready" | "empty" | "error";

const STAGE_ACTION_PATHS = {
    start: REST_FUNCTION_PATHS.startProductionPlanStage,
    pause: REST_FUNCTION_PATHS.pauseProductionPlanStage,
    continue: REST_FUNCTION_PATHS.continueProductionPlanStage,
} as const satisfies Record<ProductionPlanAction, string>;

function defaultFilters(): ProductionPlanFilters {
    return {
        dateFrom: "",
        dateTo: "",
        resourceCode: null,
    };
}

export function useProductionPlan() {
    const { session } = useSession();
    const [filters, setFilters] = useState<ProductionPlanFilters>(defaultFilters);
    const [searchQuery, setSearchQuery] = useState("");
    const [machineOptions, setMachineOptions] = useState<ProductionPlanMachine[]>([]);
    const [isMachineOptionsLoading, setIsMachineOptionsLoading] = useState(false);
    const [stages, setStages] = useState<ProductionStage[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [dataStatus, setDataStatus] = useState<ProductionPlanDataStatus>("idle");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isActionPending, setIsActionPending] = useState(false);

    const filtersRef = useRef(filters);
    filtersRef.current = filters;

    const refreshInFlightRef = useRef(0);

    const { mutateAsync: fetchProductionPlan } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getProductionPlan,
        {},
    );

    const { mutateAsync: fetchProductionPlanMachines } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getProductionPlanMachines,
        {},
    );

    const fetchProductionPlanMachinesRef = useRef(fetchProductionPlanMachines);
    fetchProductionPlanMachinesRef.current = fetchProductionPlanMachines;

    const { mutateAsync: startProductionPlanStage } = rqClient.useMutation(
        "post",
        STAGE_ACTION_PATHS.start,
        {},
    );

    const { mutateAsync: pauseProductionPlanStage } = rqClient.useMutation(
        "post",
        STAGE_ACTION_PATHS.pause,
        {},
    );

    const { mutateAsync: continueProductionPlanStage } = rqClient.useMutation(
        "post",
        STAGE_ACTION_PATHS.continue,
        {},
    );

    const loadMachineOptions = useCallback(async () => {
        setIsMachineOptionsLoading(true);
        try {
            const payload = await fetchProductionPlanMachinesRef.current({ body: [] });
            setMachineOptions(mapProductionPlanMachinesPayload(payload));
        } catch {
            setMachineOptions([]);
        } finally {
            setIsMachineOptionsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadMachineOptions();
    }, [loadMachineOptions]);

    useEffect(() => {
        setFilters((prev) => {
            if (
                prev.resourceCode === null ||
                machineOptions.some((item) => item.resourceCode === prev.resourceCode)
            ) {
                return prev;
            }
            return { ...prev, resourceCode: null };
        });
    }, [machineOptions]);

    const refresh = useCallback(async () => {
        const requestFilters = filtersRef.current;

        refreshInFlightRef.current += 1;
        setIsRefreshing(true);
        setFetchError(null);

        try {
            const payload = await fetchProductionPlan({
                body: [
                    {
                        dateFrom: requestFilters.dateFrom,
                        dateTo: requestFilters.dateTo,
                        resourceCode: requestFilters.resourceCode,
                    },
                ],
            });
            const mapped = mapProductionPlanPayload(payload);
            setStages(mapped);
            setSelectedId(null);
            setDataStatus(mapped.length > 0 ? "ready" : "empty");
        } catch (error) {
            setStages([]);
            setSelectedId(null);
            setDataStatus("error");
            setFetchError(error instanceof Error ? error.message : "Не удалось загрузить производственный план");
        } finally {
            refreshInFlightRef.current -= 1;
            if (refreshInFlightRef.current <= 0) {
                refreshInFlightRef.current = 0;
                setIsRefreshing(false);
            }
        }
    }, [fetchProductionPlan]);

    const initialLoadDoneRef = useRef(false);

    useEffect(() => {
        if (initialLoadDoneRef.current) {
            return;
        }
        initialLoadDoneRef.current = true;
        void refresh();
    }, [refresh]);

    const filteredStages = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            return stages;
        }

        return stages.filter((stage) =>
            [
                stage.orderId,
                stage.stageId,
                stage.client,
                stage.clientNumber,
                stage.product,
                stage.stageName,
                stage.area,
                stage.machine,
                stage.operationNo,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query)),
        );
    }, [searchQuery, stages]);

    const applyAction = useCallback(
        async (stageId: string, action: ProductionPlanAction, options?: ApplyProductionPlanActionOptions) => {
            setIsActionPending(true);
            setActionError(null);

            try {
                const fallback = productionPlanActionErrorMessage(action);
                let response;

                if (action === "pause") {
                    const comment = options?.comment?.trim() ?? "";
                    if (!comment) {
                        throw new Error("Укажите комментарий к приостановке");
                    }

                    const stage = stages.find((item) => item.stageId === stageId);
                    const workAreaId = stage?.workAreaId.trim();
                    const startedBy =
                        session?.mesProfile?.fio?.trim() || session?.sub?.trim() || "";
                    if (!workAreaId) {
                        throw new Error("Не удалось определить workAreaId этапа");
                    }
                    if (!startedBy) {
                        throw new Error("Не удалось определить ФИО пользователя (mesUserProfile)");
                    }

                    response = await pauseProductionPlanStage({
                        body: [{ workAreaId, startedBy, comment }],
                    });
                } else if (action === "start") {
                    const stage = stages.find((item) => item.stageId === stageId);
                    const workAreaId = stage?.workAreaId.trim();
                    const startedBy =
                        session?.mesProfile?.fio?.trim() || session?.sub?.trim() || "";
                    if (!workAreaId) {
                        throw new Error("Не удалось определить workAreaId этапа");
                    }
                    if (!startedBy) {
                        throw new Error("Не удалось определить ФИО пользователя (mesUserProfile)");
                    }

                    response = await startProductionPlanStage({
                        body: [{ workAreaId, startedBy }],
                    });
                } else {
                    const stage = stages.find((item) => item.stageId === stageId);
                    const workAreaId = stage?.workAreaId.trim();
                    const startedBy =
                        session?.mesProfile?.fio?.trim() || session?.sub?.trim() || "";
                    if (!workAreaId) {
                        throw new Error("Не удалось определить workAreaId этапа");
                    }
                    if (!startedBy) {
                        throw new Error("Не удалось определить ФИО пользователя (mesUserProfile)");
                    }

                    response = await continueProductionPlanStage({
                        body: [{ workAreaId, startedBy }],
                    });
                }

                assertProductionPlanStageActionSuccess(response, fallback);

                setStages((prev) => applyStageAction(prev, stageId, action));
                // После успешного действия всегда перечитываем план с бэка,
                // чтобы таблица была 100% согласована с серверным состоянием.
                await refresh();
            } catch (error) {
                const fallback = productionPlanActionErrorMessage(action);
                setActionError(error instanceof Error ? error.message : fallback);
                throw error;
            } finally {
                setIsActionPending(false);
            }
        },
        [continueProductionPlanStage, pauseProductionPlanStage, refresh, session, stages, startProductionPlanStage],
    );

    return {
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,
        machineOptions,
        isMachineOptionsLoading,
        stages,
        filteredStages,
        selectedId,
        setSelectedId,
        refresh,
        isRefreshing,
        fetchError,
        actionError,
        dataStatus,
        isActionPending,
        applyAction,
    };
}
