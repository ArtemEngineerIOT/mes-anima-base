import { useCallback, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { mapMonitoringStageEventsPayload } from "./map-monitoring-stage-events-payload";
import { type MonitoringTablesLoadOptions } from "./monitoring-tables-refresh";
import { MONITORING_EMPTY_STAGE_EVENTS, type MonitoringStageEventRow } from "./types";
import { useMonitoringTablesPoll } from "./use-monitoring-tables-poll";

type UseMonitoringStageEventsOptions = {
    workAreaId?: string;
    enabled?: boolean;
};

export function useMonitoringStageEvents({ workAreaId, enabled = true }: UseMonitoringStageEventsOptions) {
    const [stageEvents, setStageEvents] = useState<MonitoringStageEventRow[]>(MONITORING_EMPTY_STAGE_EVENTS);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: fetchMonitoringStageEvents } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getArmExecutionMonitoringStageEvents,
        {},
    );

    const fetchMonitoringStageEventsRef = useRef(fetchMonitoringStageEvents);
    fetchMonitoringStageEventsRef.current = fetchMonitoringStageEvents;

    const resetState = useCallback(() => {
        setStageEvents(MONITORING_EMPTY_STAGE_EVENTS);
        setError(null);
    }, []);

    const load = useCallback(async (options?: MonitoringTablesLoadOptions) => {
        const silent = options?.silent ?? false;
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            resetState();
            setError("Не удалось определить workAreaId этапа");
            return;
        }

        if (!silent) {
            setIsLoading(true);
            setError(null);
        }

        try {
            const payload = await fetchMonitoringStageEventsRef.current({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });
            setStageEvents(mapMonitoringStageEventsPayload(payload));
            if (silent) {
                setError(null);
            }
        } catch (loadError) {
            if (!silent) {
                resetState();
            }
            setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить события по этапу");
        } finally {
            if (!silent) {
                setIsLoading(false);
            }
        }
    }, [resetState, workAreaId]);

    useMonitoringTablesPoll(enabled, load);

    return {
        stageEvents,
        isLoading,
        error,
        reload: load,
    };
}
