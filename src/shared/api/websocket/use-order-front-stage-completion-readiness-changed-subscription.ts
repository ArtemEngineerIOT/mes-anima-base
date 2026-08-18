import { useEffect, useRef } from "react";

import { webSocket, type IncomingMessage } from "./index";
import { ORDER_FRONT_STAGE_COMPLETION_READINESS_CHANGED_STOMP_DESTINATION } from "./order-front-stage-completion-readiness-changed-destination";

type UseOrderFrontStageCompletionReadinessChangedSubscriptionOptions = {
    enabled: boolean;
    onEvent: (payload: unknown) => void;
};

/**
 * STOMP подписка на `stageCompletionReadinessChanged` (Aggregate orderFrontEvents).
 * Тело события: `[{ work_area_id, blocking_issues, can_complete, blocker_count, changed_at }]`.
 * Обновляет шапку, баннер и кнопку блока «Завершить этап»
 * (старт — `getOrderExecution.stage_completion_block`).
 */
export function useOrderFrontStageCompletionReadinessChangedSubscription({
    enabled,
    onEvent,
}: UseOrderFrontStageCompletionReadinessChangedSubscriptionOptions) {
    const onEventRef = useRef(onEvent);

    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        let disposed = false;
        const subscriptionIds: string[] = [];

        const unwatch = webSocket.onMessage.watch((message: IncomingMessage) => {
            if (disposed) {
                return;
            }

            if (message.headers.destination !== ORDER_FRONT_STAGE_COMPLETION_READINESS_CHANGED_STOMP_DESTINATION) {
                return;
            }

            onEventRef.current(message.body);
        });

        void webSocket
            .subscribe({
                destination: ORDER_FRONT_STAGE_COMPLETION_READINESS_CHANGED_STOMP_DESTINATION,
            })
            .then((id) => {
                if (disposed) {
                    if (id) {
                        void webSocket.unsubscribe({ subscription: id });
                    }
                    return;
                }

                if (id) {
                    subscriptionIds.push(id);
                }
            });

        return () => {
            disposed = true;
            unwatch();
            for (const subscriptionId of subscriptionIds) {
                void webSocket.unsubscribe({ subscription: subscriptionId });
            }
        };
    }, [enabled]);
}
