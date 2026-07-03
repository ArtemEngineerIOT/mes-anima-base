import { useCallback, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { mapMonitoringSummaryPayload } from "./map-monitoring-summary-payload";
import { type MonitoringTablesLoadOptions } from "./monitoring-tables-refresh";
import { MONITORING_EMPTY_LINE_METERS, type MonitoringLineMeters } from "./types";
import { useMonitoringTablesPoll } from "./use-monitoring-tables-poll";

type UseMonitoringLineMetersOptions = {
    workAreaId?: string;
    enabled?: boolean;
};

export function useMonitoringLineMeters({ workAreaId, enabled = true }: UseMonitoringLineMetersOptions) {
    const [lineMeters, setLineMeters] = useState<MonitoringLineMeters>(MONITORING_EMPTY_LINE_METERS);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: fetchMonitoringSummary } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getArmExecutionMonitoringSummary,
        {},
    );

    const fetchMonitoringSummaryRef = useRef(fetchMonitoringSummary);
    fetchMonitoringSummaryRef.current = fetchMonitoringSummary;

    const resetState = useCallback(() => {
        setLineMeters(MONITORING_EMPTY_LINE_METERS);
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
            const payload = await fetchMonitoringSummaryRef.current({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });
            setLineMeters(mapMonitoringSummaryPayload(payload));
            if (silent) {
                setError(null);
            }
        } catch (loadError) {
            if (!silent) {
                resetState();
            }
            setError(
                loadError instanceof Error ? loadError.message : "Не удалось загрузить метраж входа и выхода",
            );
        } finally {
            if (!silent) {
                setIsLoading(false);
            }
        }
    }, [resetState, workAreaId]);

    useMonitoringTablesPoll(enabled, load);

    return {
        lineMeters,
        isLoading,
        error,
        reload: load,
    };
}
