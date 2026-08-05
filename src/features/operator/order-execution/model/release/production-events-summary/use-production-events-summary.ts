import { useCallback, useEffect, useRef, useState } from "react";

import { useMaterialsFrontRollReleaseProductionEventsSummaryChangedSubscription } from "@/shared/api/websocket";

import {
    mapReleaseProductionEventsSummaryChangedPayload,
    readReleaseProductionEventsSummaryChangedWorkAreaId,
} from "./map-release-production-events-summary-changed-payload";
import {
    RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY,
    type ReleaseProductionEventsSummarySnapshot,
} from "./types";

type UseProductionEventsSummaryOptions = {
    workAreaId?: string;
    /** Стартовая сводка из getOrderExecution (`release_block`) */
    initialSnapshot?: ReleaseProductionEventsSummarySnapshot | null;
    /** Подписка STOMP активна */
    enabled?: boolean;
    /**
     * После STOMP для текущего workAreaId (только сводка обновилась).
     * Используется для silent-reload таблицы «Сигналы машины (выпуск)».
     */
    onSummaryChanged?: () => void;
};

function resolveInitialSnapshot(
    initialSnapshot?: ReleaseProductionEventsSummarySnapshot | null,
): ReleaseProductionEventsSummarySnapshot {
    return initialSnapshot ?? RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY;
}

export function useProductionEventsSummary({
    workAreaId,
    initialSnapshot = null,
    enabled = true,
    onSummaryChanged,
}: UseProductionEventsSummaryOptions) {
    const [snapshot, setSnapshot] = useState<ReleaseProductionEventsSummarySnapshot>(() =>
        resolveInitialSnapshot(initialSnapshot),
    );

    const workAreaIdRef = useRef(workAreaId);
    workAreaIdRef.current = workAreaId;
    const onSummaryChangedRef = useRef(onSummaryChanged);
    onSummaryChangedRef.current = onSummaryChanged;

    const resetState = useCallback(() => {
        setSnapshot(resolveInitialSnapshot(initialSnapshot));
    }, [initialSnapshot]);

    useEffect(() => {
        resetState();
    }, [workAreaId, initialSnapshot, resetState]);

    useMaterialsFrontRollReleaseProductionEventsSummaryChangedSubscription({
        enabled: enabled && Boolean(workAreaId?.trim()),
        onEvent: (payload) => {
            const currentWorkAreaId = workAreaIdRef.current?.trim();
            const eventWorkAreaId = readReleaseProductionEventsSummaryChangedWorkAreaId(payload);

            if (eventWorkAreaId && currentWorkAreaId && eventWorkAreaId !== currentWorkAreaId) {
                return;
            }

            const nextSnapshot = mapReleaseProductionEventsSummaryChangedPayload(payload);
            if (nextSnapshot) {
                setSnapshot(nextSnapshot);
            }

            onSummaryChangedRef.current?.();
        },
    });

    return {
        snapshot,
        unprocessedCount: snapshot.unprocessedCount,
        totalCount: snapshot.totalCount,
        changedAt: snapshot.changedAt,
    };
}
