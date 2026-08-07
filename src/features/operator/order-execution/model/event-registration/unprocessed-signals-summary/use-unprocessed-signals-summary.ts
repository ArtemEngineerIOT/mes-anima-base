import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useMaterialsFrontMachineSignalsSummaryChangedSubscription } from "@/shared/api/websocket";

import {
    mapMachineSignalsSummaryChangedPayload,
    readMachineSignalsSummaryChangedWorkAreaId,
} from "./map-machine-signals-summary-changed-payload";
import { mapUnprocessedSignalsSummaryPayload } from "./map-unprocessed-signals-summary-payload";
import { UNPROCESSED_SIGNALS_SUMMARY_EMPTY, type UnprocessedSignalsSummarySnapshot } from "./types";

type LoadOptions = {
    silent?: boolean;
};

type UseUnprocessedSignalsSummaryOptions = {
    workAreaId?: string;
    /** Стартовая сводка из getOrderExecution (`machine_signals_block`) */
    initialSnapshot?: UnprocessedSignalsSummarySnapshot | null;
    enabled?: boolean;
    /** После STOMP / fallback — silent-reload таблицы необработанных сигналов */
    onSummaryChanged?: () => void;
};

function resolveInitialSnapshot(
    initialSnapshot?: UnprocessedSignalsSummarySnapshot | null,
): UnprocessedSignalsSummarySnapshot {
    return initialSnapshot ?? UNPROCESSED_SIGNALS_SUMMARY_EMPTY;
}

/**
 * Сводка блока «Регистрация события»:
 * - старт экрана: `getOrderExecution` (`machine_signals_block`)
 * - дальше: STOMP `machineSignalsSummaryChanged`
 * - fallback: `getUnprocessedSignalsSummary`, если в STOMP нет данных сводки
 */
export function useUnprocessedSignalsSummary({
    workAreaId,
    initialSnapshot = null,
    enabled = true,
    onSummaryChanged,
}: UseUnprocessedSignalsSummaryOptions) {
    const [snapshot, setSnapshot] = useState<UnprocessedSignalsSummarySnapshot>(() =>
        resolveInitialSnapshot(initialSnapshot),
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: fetchSummary } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getUnprocessedSignalsSummary,
        {},
    );

    const fetchSummaryRef = useRef(fetchSummary);
    fetchSummaryRef.current = fetchSummary;
    const workAreaIdRef = useRef(workAreaId);
    workAreaIdRef.current = workAreaId;
    const onSummaryChangedRef = useRef(onSummaryChanged);
    onSummaryChangedRef.current = onSummaryChanged;

    const resetState = useCallback(() => {
        setSnapshot(resolveInitialSnapshot(initialSnapshot));
        setError(null);
    }, [initialSnapshot]);

    useEffect(() => {
        if (!enabled) {
            resetState();
            setIsLoading(false);
            return;
        }

        resetState();
        setIsLoading(false);
    }, [enabled, resetState, workAreaId]);

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

    useMaterialsFrontMachineSignalsSummaryChangedSubscription({
        enabled: enabled && Boolean(workAreaId?.trim()),
        onEvent: (payload) => {
            const currentWorkAreaId = workAreaIdRef.current?.trim();
            const eventWorkAreaId = readMachineSignalsSummaryChangedWorkAreaId(payload);

            if (eventWorkAreaId && currentWorkAreaId && eventWorkAreaId !== currentWorkAreaId) {
                return;
            }

            const nextSnapshot = mapMachineSignalsSummaryChangedPayload(payload);
            if (nextSnapshot) {
                setSnapshot(nextSnapshot);
                setError(null);
                onSummaryChangedRef.current?.();
                return;
            }

            void load({ silent: true }).then(() => {
                onSummaryChangedRef.current?.();
            });
        },
    });

    return {
        snapshot,
        isLoading,
        error,
        reload: load,
    };
}
