import { useEffect, useRef } from "react";

import { webSocket, type IncomingMessage } from "./index";
import {
    MATERIALS_FRONT_ROLL_WRITE_OFF_RAW_EVENTS_SUMMARY_CHANGED_STOMP_DESTINATION,
} from "./materials-front-roll-write-off-raw-events-summary-changed-destination";

type UseMaterialsFrontRollWriteOffRawEventsSummaryChangedSubscriptionOptions = {
    enabled: boolean;
    onEvent: () => void;
};

/**
 * STOMP подписка на `rollWriteOffRawEventsSummaryChanged`.
 * Payload содержит только `changed_at` — при событии перезагружаем summary списания (SCR-04).
 */
export function useMaterialsFrontRollWriteOffRawEventsSummaryChangedSubscription({
    enabled,
    onEvent,
}: UseMaterialsFrontRollWriteOffRawEventsSummaryChangedSubscriptionOptions) {
    const onEventRef = useRef(onEvent);
    onEventRef.current = onEvent;

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

            if (
                message.headers.destination !==
                MATERIALS_FRONT_ROLL_WRITE_OFF_RAW_EVENTS_SUMMARY_CHANGED_STOMP_DESTINATION
            ) {
                return;
            }

            onEventRef.current();
        });

        void webSocket.subscribe({
            destination: MATERIALS_FRONT_ROLL_WRITE_OFF_RAW_EVENTS_SUMMARY_CHANGED_STOMP_DESTINATION,
        }).then((id) => {
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
