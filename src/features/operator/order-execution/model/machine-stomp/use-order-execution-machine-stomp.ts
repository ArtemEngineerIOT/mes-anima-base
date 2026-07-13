import { useEffect, useRef, useState } from "react";

import { webSocket, type IncomingMessage } from "@/shared/api/websocket";

import {
    ORDER_EXECUTION_MACHINE_STOMP_DESTINATION,
    ORDER_EXECUTION_MACHINE_STOMP_TAGS_DESTINATION,
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
    /** Подписка на `tags` — для таблиц технологических параметров («Показать все»). */
    subscribeToTags?: boolean;
};

type StompVariableKind = "parameters" | "tags";

function resolveStompVariableKind(destination: string | undefined): StompVariableKind | null {
    if (!destination) {
        return null;
    }

    if (destination === ORDER_EXECUTION_MACHINE_STOMP_DESTINATION) {
        return "parameters";
    }

    if (destination === ORDER_EXECUTION_MACHINE_STOMP_TAGS_DESTINATION) {
        return "tags";
    }

    return null;
}

export function useOrderExecutionMachineStomp({
    enabled,
    workAreaId,
    subscribeToTags = false,
}: UseOrderExecutionMachineStompOptions) {
    const isStompConnected = useWebSocketStompConnected(enabled);
    const [hasReceivedStompData, setHasReceivedStompData] = useState(false);
    const [hasReceivedTagsData, setHasReceivedTagsData] = useState(false);
    const [snapshot, setSnapshot] = useState(ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER);
    const [tagsSnapshot, setTagsSnapshot] = useState(ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER);

    const onMessageRef = useRef<(kind: StompVariableKind, body: unknown) => void>(() => undefined);

    onMessageRef.current = (kind, body) => {
        const mapped = mapOrderExecutionMachineStompPayload(body);

        if (kind === "parameters") {
            setHasReceivedStompData(true);
            setSnapshot(mapped);
            return;
        }

        setHasReceivedTagsData(true);
        setTagsSnapshot(mapped);
    };

    useEffect(() => {
        setSnapshot(ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER);
        setTagsSnapshot(ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER);
        setHasReceivedStompData(false);
        setHasReceivedTagsData(false);
    }, [workAreaId]);

    useEffect(() => {
        if (!enabled) {
            setSnapshot(ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER);
            setTagsSnapshot(ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER);
            setHasReceivedStompData(false);
            setHasReceivedTagsData(false);
            return;
        }

        setSnapshot(ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER);
        setTagsSnapshot(ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER);
        setHasReceivedStompData(false);
        setHasReceivedTagsData(false);

        const destinations = [
            ORDER_EXECUTION_MACHINE_STOMP_DESTINATION,
            ...(subscribeToTags ? [ORDER_EXECUTION_MACHINE_STOMP_TAGS_DESTINATION] : []),
        ] as const;

        let disposed = false;
        const subscriptionIds: string[] = [];

        const unwatch = webSocket.onMessage.watch((message: IncomingMessage) => {
            if (disposed) {
                return;
            }

            const kind = resolveStompVariableKind(message.headers.destination);
            if (!kind) {
                return;
            }

            if (kind === "tags" && !subscribeToTags) {
                return;
            }

            onMessageRef.current(kind, message.body);
        });

        for (const destination of destinations) {
            void webSocket.subscribe({ destination }).then((id) => {
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
        }

        return () => {
            disposed = true;
            unwatch();
            for (const subscriptionId of subscriptionIds) {
                void webSocket.unsubscribe({ subscription: subscriptionId });
            }
        };
    }, [enabled, workAreaId, subscribeToTags]);

    const state: OrderExecutionMachineStompState = {
        snapshot,
        tagsSnapshot,
        isStompConnected,
        hasReceivedStompData,
        hasReceivedTagsData,
    };

    return state;
}
