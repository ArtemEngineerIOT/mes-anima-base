import { useCallback, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { mapMonitoringRollTablesPayload } from "./map-monitoring-roll-tables-payload";
import { type MonitoringTablesLoadOptions } from "./monitoring-tables-refresh";
import {
    MONITORING_EMPTY_ROLL_TABLES,
    MONITORING_ROLL_TABLES_PREVIEW_LIMIT,
    type MonitoringRollTables,
} from "./types";
import { useMonitoringTablesPoll } from "./use-monitoring-tables-poll";

type UseMonitoringRollTablesOptions = {
    workAreaId?: string;
    previewLimit?: string;
    enabled?: boolean;
};

export function useMonitoringRollTables({
    workAreaId,
    previewLimit = MONITORING_ROLL_TABLES_PREVIEW_LIMIT,
    enabled = true,
}: UseMonitoringRollTablesOptions) {
    const [rollTables, setRollTables] = useState<MonitoringRollTables>(MONITORING_EMPTY_ROLL_TABLES);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: fetchMonitoringRollTables } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getArmExecutionMonitoringRollTables,
        {},
    );

    const fetchMonitoringRollTablesRef = useRef(fetchMonitoringRollTables);
    fetchMonitoringRollTablesRef.current = fetchMonitoringRollTables;

    const resetState = useCallback(() => {
        setRollTables(MONITORING_EMPTY_ROLL_TABLES);
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
            const payload = await fetchMonitoringRollTablesRef.current({
                body: [
                    {
                        workAreaId: trimmedWorkAreaId,
                        previewLimit: previewLimit.trim() || MONITORING_ROLL_TABLES_PREVIEW_LIMIT,
                    },
                ],
            });
            setRollTables(mapMonitoringRollTablesPayload(payload));
            if (silent) {
                setError(null);
            }
        } catch (loadError) {
            if (!silent) {
                resetState();
            }
            setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить таблицы рулонов");
        } finally {
            if (!silent) {
                setIsLoading(false);
            }
        }
    }, [previewLimit, resetState, workAreaId]);

    useMonitoringTablesPoll(enabled, load);

    return {
        rollTables,
        isLoading,
        error,
        reload: load,
    };
}
