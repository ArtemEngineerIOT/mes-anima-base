import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { mapUnprocessedSignalsSummaryPayload } from "./map-unprocessed-signals-summary-payload";
import { UNPROCESSED_SIGNALS_SUMMARY_EMPTY, type UnprocessedSignalsSummarySnapshot } from "./types";

type LoadOptions = {
    silent?: boolean;
};

type UseUnprocessedSignalsSummaryOptions = {
    workAreaId?: string;
    enabled?: boolean;
};

export function useUnprocessedSignalsSummary({ workAreaId, enabled = true }: UseUnprocessedSignalsSummaryOptions) {
    const [snapshot, setSnapshot] = useState<UnprocessedSignalsSummarySnapshot>(UNPROCESSED_SIGNALS_SUMMARY_EMPTY);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: fetchSummary } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getUnprocessedSignalsSummary,
        {},
    );

    const fetchSummaryRef = useRef(fetchSummary);
    fetchSummaryRef.current = fetchSummary;

    const resetState = useCallback(() => {
        setSnapshot(UNPROCESSED_SIGNALS_SUMMARY_EMPTY);
        setError(null);
    }, []);

    const load = useCallback(
        async (options?: LoadOptions) => {
            const silent = options?.silent ?? false;
            const trimmedWorkAreaId = workAreaId?.trim();
            if (!trimmedWorkAreaId) {
                resetState();
                setIsLoading(false);
                return;
            }

            if (!silent) {
                setIsLoading(true);
                setError(null);
            }

            try {
                const payload = await fetchSummaryRef.current({
                    body: [{ workAreaId: trimmedWorkAreaId }],
                });
                setSnapshot(mapUnprocessedSignalsSummaryPayload(payload));
                if (silent) {
                    setError(null);
                }
            } catch (loadError) {
                if (!silent) {
                    resetState();
                }
                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Не удалось загрузить сводку сигналов с машины",
                );
            } finally {
                if (!silent) {
                    setIsLoading(false);
                }
            }
        },
        [resetState, workAreaId],
    );

    useEffect(() => {
        if (!enabled) {
            resetState();
            setIsLoading(false);
            return;
        }

        void load();
    }, [enabled, load, resetState]);

    return {
        snapshot,
        isLoading,
        error,
        reload: load,
    };
}
