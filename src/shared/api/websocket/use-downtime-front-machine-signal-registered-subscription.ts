import { useEffect, useRef } from "react";

import { webSocket, type IncomingMessage } from "./index";
import { DOWNTIME_FRONT_MACHINE_SIGNAL_REGISTERED_STOMP_DESTINATION } from "./downtime-front-machine-signal-registered-destination";

type UseDowntimeFrontMachineSignalRegisteredSubscriptionOptions = {
    enabled: boolean;
    onEvent: () => void;
};

/**
 * STOMP подписка на `machineSignalRegistered`.
 * Payload содержит только `registered_at` — при событии на экране с этапом перезагружаем сводку.
 */
export function useDowntimeFrontMachineSignalRegisteredSubscription({
    enabled,
    onEvent,
}: UseDowntimeFrontMachineSignalRegisteredSubscriptionOptions) {
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

            if (message.headers.destination !== DOWNTIME_FRONT_MACHINE_SIGNAL_REGISTERED_STOMP_DESTINATION) {
                return;
            }

            onEventRef.current();
        });

        void webSocket.subscribe({
            destination: DOWNTIME_FRONT_MACHINE_SIGNAL_REGISTERED_STOMP_DESTINATION,
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
