import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { useSyncLoadingOnEnable } from "../use-loading-on-enable";
import {
    mapEventReleaseProductionPayload,
} from "../release/map-event-release-production-payload";
import {
    RELEASE_EMPTY_PRODUCTION_EVENT,
    type ReleaseProductionEventSnapshot,
} from "../release/production-event-types";

type LoadListMaterialSignalsOptions = {
    silent?: boolean;
};

type UseListMaterialSignalsOptions = {
    workAreaId?: string;
    /** Загрузка при раскрытии блока «Материалы. Списание/возврат» */
    enabled?: boolean;
};

/**
 * Таблица необработанных сигналов списания:
 * - `getListMaterialSignal` `[{ workAreaId }]` при раскрытии блока
 * - silent-reload по тому же STOMP, что обновляет плашку сводки (с сохранением выбора)
 */
export function useListMaterialSignals({
    workAreaId,
    enabled = false,
}: UseListMaterialSignalsOptions) {
    const [snapshot, setSnapshot] = useState<ReleaseProductionEventSnapshot>(
        RELEASE_EMPTY_PRODUCTION_EVENT,
    );
    const [isLoading, setIsLoading] = useState(enabled);
    useSyncLoadingOnEnable(enabled, setIsLoading);
    const [error, setError] = useState<string | null>(null);
    const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);

    const { mutateAsync: fetchList } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getListMaterialSignal,
        {},
    );

    const fetchListRef = useRef(fetchList);
    fetchListRef.current = fetchList;
    const selectedSignalIdRef = useRef(selectedSignalId);
    selectedSignalIdRef.current = selectedSignalId;

    const resetState = useCallback(() => {
        setSnapshot(RELEASE_EMPTY_PRODUCTION_EVENT);
        setSelectedSignalId(null);
        setError(null);
        setIsLoading(false);
    }, []);

    const load = useCallback(async (
        trimmedWorkAreaId: string,
        options?: LoadListMaterialSignalsOptions,
    ) => {
        const silent = options?.silent ?? false;

        if (!silent) {
            setIsLoading(true);
            setError(null);
        }

        try {
            const payload = await fetchListRef.current({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });
            const mapped = mapEventReleaseProductionPayload(payload);
            setSnapshot(mapped);

            if (silent) {
                const previousSelectedId = selectedSignalIdRef.current;
                const nextSelectedId =
                    previousSelectedId && mapped.eventList.some((row) => row.id === previousSelectedId)
                        ? previousSelectedId
                        : null;

                setSelectedSignalId(nextSelectedId);
                setError(null);
            } else {
                setSelectedSignalId(null);
            }
        } catch (loadError) {
            if (!silent) {
                setSnapshot(RELEASE_EMPTY_PRODUCTION_EVENT);
                setSelectedSignalId(null);
                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Не удалось загрузить сигналы списания",
                );
            }
        } finally {
            if (!silent) {
                setIsLoading(false);
            }
        }
    }, []);

    const reloadSilent = useCallback(() => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            return;
        }

        void load(trimmedWorkAreaId, { silent: true });
    }, [load, workAreaId]);

    const toggleSignalSelection = useCallback((rowId: string) => {
        setSelectedSignalId((prev) => (prev === rowId ? null : rowId));
    }, []);

    useEffect(() => {
        if (!enabled) {
            setIsLoading(false);
            return;
        }

        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            resetState();
            setError("Не удалось определить workAreaId этапа");
            return;
        }

        void load(trimmedWorkAreaId);
    }, [enabled, load, resetState, workAreaId]);

    return {
        signalList: snapshot.eventList,
        emptyStateMessage: snapshot.emptyStateMessage,
        isLoading,
        error,
        selectedSignalId,
        toggleSignalSelection,
        reloadSilent,
    };
}
