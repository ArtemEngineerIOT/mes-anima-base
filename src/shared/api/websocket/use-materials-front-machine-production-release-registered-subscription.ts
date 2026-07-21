import { useEffect, useRef } from "react";

import { webSocket, type IncomingMessage } from "./index";
import { MATERIALS_FRONT_MACHINE_PRODUCTION_RELEASE_REGISTERED_STOMP_DESTINATION } from "./materials-front-machine-production-release-registered-destination";

type UseMaterialsFrontMachineProductionReleaseRegisteredSubscriptionOptions = {
    enabled: boolean;
    onEvent: () => void;
};

/**
 * STOMP подписка на `machineProductionReleaseRegistered`.
 * Payload содержит только `registered_at` — при событии на экране с этапом перезагружаем сводку.
 */
export function useMaterialsFrontMachineProductionReleaseRegisteredSubscription({
    enabled,
    onEvent,
}: UseMaterialsFrontMachineProductionReleaseRegisteredSubscriptionOptions) {
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
                MATERIALS_FRONT_MACHINE_PRODUCTION_RELEASE_REGISTERED_STOMP_DESTINATION
            ) {
                return;
            }

            onEventRef.current();
        });

        void webSocket.subscribe({
            destination: MATERIALS_FRONT_MACHINE_PRODUCTION_RELEASE_REGISTERED_STOMP_DESTINATION,
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
