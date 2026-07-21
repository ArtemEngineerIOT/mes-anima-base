import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useMaterialsFrontMachineRawReleaseRegisteredSubscription } from "@/shared/api/websocket";

import { mapRollWriteOffEventsSummaryPayload } from "./map-roll-write-off-events-summary-payload";
import { ROLL_WRITE_OFF_EVENTS_SUMMARY_EMPTY, type RollWriteOffEventsSummarySnapshot } from "./types";

type LoadOptions = {
    silent?: boolean;
};

type UseRollWriteOffEventsSummaryOptions = {
    workAreaId?: string;
    enabled?: boolean;
};

export function useRollWriteOffEventsSummary({
    workAreaId,
    enabled = true,
}: UseRollWriteOffEventsSummaryOptions) {
    const [snapshot, setSnapshot] = useState<RollWriteOffEventsSummarySnapshot>(
        ROLL_WRITE_OFF_EVENTS_SUMMARY_EMPTY,
    );

    const { mutateAsync: fetchSummary } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getRollEventsSummary,
        {},
    );

    const fetchSummaryRef = useRef(fetchSummary);
    fetchSummaryRef.current = fetchSummary;

    const resetState = useCallback(() => {
        setSnapshot(ROLL_WRITE_OFF_EVENTS_SUMMARY_EMPTY);
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
                setSnapshot(mapRollWriteOffEventsSummaryPayload(payload));
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

    useMaterialsFrontMachineRawReleaseRegisteredSubscription({
        enabled: enabled && Boolean(workAreaId?.trim()),
        onEvent: () => {
            void load({ silent: true });
        },
    });

    return {
        totalCount: snapshot.totalCount,
        reload: load,
    };
}
