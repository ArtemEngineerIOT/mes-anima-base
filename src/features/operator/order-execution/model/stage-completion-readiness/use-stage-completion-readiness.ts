import { useEffect, useRef, useState } from "react";

import { useOrderFrontStageCompletionReadinessChangedSubscription } from "@/shared/api/websocket";

import {
    mapStageCompletionReadinessChangedPayload,
    readStageCompletionReadinessChangedWorkAreaId,
} from "./map-stage-completion-readiness-changed-payload";
import { STAGE_COMPLETION_READINESS_EMPTY, type StageCompletionReadinessSnapshot } from "./types";

type UseStageCompletionReadinessOptions = {
    workAreaId?: string;
    /** Стартовая сводка из getOrderExecution (`stage_completion_block`) */
    initialSnapshot?: StageCompletionReadinessSnapshot | null;
    enabled?: boolean;
    /** После STOMP — silent-reload таблиц init, если блок раскрыт */
    onReadinessChanged?: () => void;
};

type StompOverlay = {
    workAreaId: string;
    snapshot: StageCompletionReadinessSnapshot;
};

function resolveInitialSnapshot(
    initialSnapshot?: StageCompletionReadinessSnapshot | null,
): StageCompletionReadinessSnapshot {
    return initialSnapshot ?? STAGE_COMPLETION_READINESS_EMPTY;
}

/**
 * Сводка блока «Завершить этап»:
 * - старт экрана: `getOrderExecution` (`stage_completion_block`)
 * - дальше: STOMP `stageCompletionReadinessChanged`
 */
export function useStageCompletionReadiness({
    workAreaId,
    initialSnapshot = null,
    enabled = true,
    onReadinessChanged,
}: UseStageCompletionReadinessOptions) {
    const trimmedWorkAreaId = workAreaId?.trim() ?? "";
    const [overlay, setOverlay] = useState<StompOverlay | null>(null);

    const snapshot =
        overlay && overlay.workAreaId === trimmedWorkAreaId
            ? overlay.snapshot
            : resolveInitialSnapshot(initialSnapshot);

    const workAreaIdRef = useRef(workAreaId);
    const onReadinessChangedRef = useRef(onReadinessChanged);

    useEffect(() => {
        workAreaIdRef.current = workAreaId;
    }, [workAreaId]);

    useEffect(() => {
        onReadinessChangedRef.current = onReadinessChanged;
    }, [onReadinessChanged]);

    useOrderFrontStageCompletionReadinessChangedSubscription({
        enabled: enabled && Boolean(trimmedWorkAreaId),
        onEvent: (payload) => {
            const currentWorkAreaId = workAreaIdRef.current?.trim();
            const eventWorkAreaId = readStageCompletionReadinessChangedWorkAreaId(payload);

            if (eventWorkAreaId && currentWorkAreaId && eventWorkAreaId !== currentWorkAreaId) {
                return;
            }

            const nextSnapshot = mapStageCompletionReadinessChangedPayload(payload);
            if (!nextSnapshot || !currentWorkAreaId) {
                return;
            }

            setOverlay({ workAreaId: currentWorkAreaId, snapshot: nextSnapshot });
            onReadinessChangedRef.current?.();
        },
    });

    return {
        snapshot,
        canComplete: snapshot.canComplete,
        blockerCount: snapshot.blockerCount,
        blockingIssues: snapshot.blockingIssues,
    };
}
