import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useMaterialsFrontRollReleaseProductionEventsSummaryChangedSubscription } from "@/shared/api/websocket";

import { mapProductionEventsSummaryPayload } from "./map-production-events-summary-payload";
import {
    RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY,
    type ReleaseProductionEventsSummarySnapshot,
} from "./types";

type LoadOptions = {
    silent?: boolean;
};

type UseProductionEventsSummaryOptions = {
    workAreaId?: string;
    enabled?: boolean;
    /** После STOMP — silent-reload мониторинга / прогресса этапа */
    onRelatedDataReload?: () => void;
};

export function useProductionEventsSummary({
    workAreaId,
    enabled = true,
    onRelatedDataReload,
}: UseProductionEventsSummaryOptions) {
    const [snapshot, setSnapshot] = useState<ReleaseProductionEventsSummarySnapshot>(
        RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY,
    );

    const { mutateAsync: fetchSummary } = rqClient.useMutation("post", REST_FUNCTION_PATHS.getEventsSummary, {});

    const fetchSummaryRef = useRef(fetchSummary);
    fetchSummaryRef.current = fetchSummary;
    const onRelatedDataReloadRef = useRef(onRelatedDataReload);
    onRelatedDataReloadRef.current = onRelatedDataReload;

    const resetState = useCallback(() => {
        setSnapshot(RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY);
    }, []);

    const load = useCallback(
        async (options?: LoadOptions) => {
            const trimmedWorkAreaId = workAreaId?.trim();
            if (!trimmedWorkAreaId) {
                resetState();
                return;
            }

            try {
                const payload = await fetchSummaryRef.current({
                    body: [{ workAreaId: trimmedWorkAreaId }],
                });
                setSnapshot(mapProductionEventsSummaryPayload(payload));
            } catch {
                if (!options?.silent) {
                    resetState();
                }
            }
        },
        [resetState, workAreaId],
    );

    useEffect(() => {
        if (!enabled) {
            resetState();
            return;
        }

        void load();
    }, [enabled, load, resetState]);

    useMaterialsFrontRollReleaseProductionEventsSummaryChangedSubscription({
        enabled: enabled && Boolean(workAreaId?.trim()),
        onEvent: () => {
            void load({ silent: true });
            onRelatedDataReloadRef.current?.();
        },
    });

    return {
        totalCount: snapshot.totalCount,
        reload: load,
    };
}
