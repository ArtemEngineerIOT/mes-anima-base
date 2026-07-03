import { useEffect, useRef, useState } from "react";

import { webSocket, type IncomingMessage } from "@/shared/api/websocket";

import {
    ORDER_EXECUTION_MACHINE_STOMP_DESTINATION,
    mapOrderExecutionMachineStompPayload,
} from "./map-order-execution-machine-stomp";
import {
    ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER,
    type OrderExecutionMachineStompState,
} from "./order-execution-machine-data";
import { useWebSocketStompConnected } from "./use-web-socket-stomp-connected";

type UseOrderExecutionMachineStompOptions = {
    enabled: boolean;
    workAreaId?: string;
};

export function useOrderExecutionMachineStomp({ enabled, workAreaId }: UseOrderExecutionMachineStompOptions) {
    const isStompConnected = useWebSocketStompConnected(enabled);
    const [hasReceivedStompData, setHasReceivedStompData] = useState(false);
    const [snapshot, setSnapshot] = useState(ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER);
    const onMessageRef = useRef<(body: unknown) => void>((body) => {
        setHasReceivedStompData(true);
        setSnapshot(mapOrderExecutionMachineStompPayload(body));
    });

    onMessageRef.current = (body) => {
        setHasReceivedStompData(true);
        setSnapshot(mapOrderExecutionMachineStompPayload(body));
    };

    useEffect(() => {
        setSnapshot(ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER);
        setHasReceivedStompData(false);
    }, [workAreaId]);

    useEffect(() => {
        if (!enabled) {
            setSnapshot(ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER);
            setHasReceivedStompData(false);
            return;
        }

        setSnapshot(ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER);
        setHasReceivedStompData(false);
        const destination = ORDER_EXECUTION_MACHINE_STOMP_DESTINATION;

        let disposed = false;
        let subscriptionId: string | null = null;
        const unwatch = webSocket.onMessage.watch((message: IncomingMessage) => {
            if (disposed) {
                return;
            }

            const messageDestination = message.headers.destination;
            if (messageDestination && messageDestination !== destination) {
                return;
            }

            onMessageRef.current(message.body);
        });

        void webSocket.subscribe({ destination }).then((id) => {
            if (disposed) {
                if (id) {
                    void webSocket.unsubscribe({ subscription: id });
                }
                return;
            }

            subscriptionId = id;
        });

        return () => {
            disposed = true;
            unwatch();
            if (subscriptionId) {
                void webSocket.unsubscribe({ subscription: subscriptionId });
            }
        };
    }, [enabled, workAreaId]);

    const state: OrderExecutionMachineStompState = {
        snapshot,
        isStompConnected,
        hasReceivedStompData,
    };

    return state;
}
