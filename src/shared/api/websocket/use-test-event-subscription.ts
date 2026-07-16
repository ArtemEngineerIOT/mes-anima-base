import { useEffect } from "react";

import { webSocket, type IncomingMessage } from "@/shared/api/websocket";
import { TEST_EVENT_STOMP_DESTINATION } from "@/shared/api/websocket/test-event-destination";

type UseTestEventStompSubscriptionOptions = {
    enabled?: boolean;
};

function logTestEventMessage(body: unknown): void {
    if (import.meta.env.DEV || import.meta.env.VITE_WS_DEBUG === "true") {
        console.info("[WS testEvent]", body);
    }
}

export function useTestEventStompSubscription({ enabled = true }: UseTestEventStompSubscriptionOptions = {}) {
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

            if (message.headers.destination !== TEST_EVENT_STOMP_DESTINATION) {
                return;
            }

            logTestEventMessage(message.body);
        });

        void webSocket.subscribe({ destination: TEST_EVENT_STOMP_DESTINATION }).then((id) => {
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
