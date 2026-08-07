import { useEffect, useRef } from "react";

import { webSocket, type IncomingMessage } from "./index";
import {
    MATERIALS_FRONT_MACHINE_SIGNALS_SUMMARY_CHANGED_STOMP_DESTINATION,
} from "./materials-front-machine-signals-summary-changed-destination";

type UseMaterialsFrontMachineSignalsSummaryChangedSubscriptionOptions = {
    enabled: boolean;
    onEvent: (payload: unknown) => void;
};

/**
 * STOMP подписка на `machineSignalsSummaryChanged` (Aggregate downtimeFrontEvents).
 * Обновляет сводку блока «Регистрация события»
 * (старт — `getOrderExecution.machine_signals_block`).
 */
export function useMaterialsFrontMachineSignalsSummaryChangedSubscription({
    enabled,
    onEvent,
}: UseMaterialsFrontMachineSignalsSummaryChangedSubscriptionOptions) {
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
                MATERIALS_FRONT_MACHINE_SIGNALS_SUMMARY_CHANGED_STOMP_DESTINATION
            ) {
                return;
            }

            onEventRef.current(message.body);
        });

        void webSocket.subscribe({
            destination: MATERIALS_FRONT_MACHINE_SIGNALS_SUMMARY_CHANGED_STOMP_DESTINATION,
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
