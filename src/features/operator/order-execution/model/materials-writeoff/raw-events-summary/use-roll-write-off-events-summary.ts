import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useMaterialsFrontRollWriteOffRawEventsSummaryChangedSubscription } from "@/shared/api/websocket";

import {
    mapRollWriteOffEventsSummaryChangedPayload,
    readRollWriteOffEventsSummaryChangedWorkAreaId,
} from "./map-roll-write-off-events-summary-changed-payload";
import { mapRollWriteOffEventsSummaryPayload } from "./map-roll-write-off-events-summary-payload";
import { ROLL_WRITE_OFF_EVENTS_SUMMARY_EMPTY, type RollWriteOffEventsSummarySnapshot } from "./types";

type UseRollWriteOffEventsSummaryOptions = {
    workAreaId?: string;
    /** Стартовая сводка из getOrderExecution (`write_off_block`) */
    initialSnapshot?: RollWriteOffEventsSummarySnapshot | null;
    /** Подписка STOMP активна */
    enabled?: boolean;
    /** После обновления сводки (STOMP / fallback RPC) — silent-reload таблицы сигналов */
    onSummaryChanged?: () => void;
};

/** Как `changed_at` в `write_off_block`: `dd.MM.yyyy HH:mm:ss`. */
function formatClientChangedAt(date = new Date()): string {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function withChangedAtFallback(
    snapshot: RollWriteOffEventsSummarySnapshot,
    previousChangedAt?: string | null,
): RollWriteOffEventsSummarySnapshot {
    if (snapshot.changedAt) {
        return snapshot;
    }

    const hasData =
        snapshot.totalCount > 0 ||
        snapshot.unprocessedCount > 0 ||
        snapshot.processedCount > 0;

    if (!hasData) {
        return snapshot;
    }

    const fallback = previousChangedAt?.trim() || formatClientChangedAt();
    return { ...snapshot, changedAt: fallback };
}

function resolveInitialSnapshot(
    initialSnapshot?: RollWriteOffEventsSummarySnapshot | null,
): RollWriteOffEventsSummarySnapshot {
    return initialSnapshot ?? ROLL_WRITE_OFF_EVENTS_SUMMARY_EMPTY;
}

/**
 * Сводка блока «Материалы. Списание/возврат»:
 * - старт экрана: `getOrderExecution` (`write_off_block`)
 * - дальше: STOMP `rollWriteOffRawEventsSummaryChanged`
 * - fallback: `getMaterialEventsSummary`, если в STOMP нет счётчиков
 */
export function useRollWriteOffEventsSummary({
    workAreaId,
    initialSnapshot = null,
    enabled = true,
    onSummaryChanged,
}: UseRollWriteOffEventsSummaryOptions) {
    const [snapshot, setSnapshot] = useState<RollWriteOffEventsSummarySnapshot>(() =>
        resolveInitialSnapshot(initialSnapshot),
    );

    const { mutateAsync: fetchSummary } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getMaterialEventsSummary,
        {},
    );

    const fetchSummaryRef = useRef(fetchSummary);
    fetchSummaryRef.current = fetchSummary;
    const workAreaIdRef = useRef(workAreaId);
    workAreaIdRef.current = workAreaId;
    const onSummaryChangedRef = useRef(onSummaryChanged);
    onSummaryChangedRef.current = onSummaryChanged;
    const snapshotRef = useRef(snapshot);
    snapshotRef.current = snapshot;

    const resetState = useCallback(() => {
        setSnapshot(resolveInitialSnapshot(initialSnapshot));
    }, [initialSnapshot]);

    useEffect(() => {
        resetState();
    }, [workAreaId, initialSnapshot, resetState]);

    const load = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            resetState();
            return;
        }

        try {
            const payload = await fetchSummaryRef.current({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });
            const mapped = mapRollWriteOffEventsSummaryPayload(payload);
            setSnapshot(withChangedAtFallback(mapped, snapshotRef.current.changedAt));
        } catch {
            resetState();
        }
    }, [resetState, workAreaId]);

    useMaterialsFrontRollWriteOffRawEventsSummaryChangedSubscription({
        enabled: enabled && Boolean(workAreaId?.trim()),
        onEvent: (payload) => {
            const currentWorkAreaId = workAreaIdRef.current?.trim();
            const eventWorkAreaId = readRollWriteOffEventsSummaryChangedWorkAreaId(payload);

            if (eventWorkAreaId && currentWorkAreaId && eventWorkAreaId !== currentWorkAreaId) {
                return;
            }

            const nextSnapshot = mapRollWriteOffEventsSummaryChangedPayload(payload);
            if (nextSnapshot) {
                setSnapshot(withChangedAtFallback(nextSnapshot, snapshotRef.current.changedAt));
                onSummaryChangedRef.current?.();
                return;
            }

            void load().then(() => {
                onSummaryChangedRef.current?.();
            });
        },
    });

    return {
        snapshot,
        unprocessedCount: snapshot.unprocessedCount,
        totalCount: snapshot.totalCount,
        changedAt: snapshot.changedAt,
        reload: load,
    };
}
