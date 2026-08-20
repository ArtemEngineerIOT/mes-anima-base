import { useEffect, useRef, useState } from "react";

import { webSocket, type IncomingMessage } from "@/shared/api/websocket";

import {
    buildOrderExecutionMachineParametersStompDestination,
    buildOrderExecutionMachineTagsStompDestination,
    mapOrderExecutionMachineStompPayload,
} from "./map-order-execution-machine-stomp";
import {
    ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER,
    type OrderExecutionMachineStompState,
} from "./order-execution-machine-data";
import { useWebSocketStompConnected } from "./use-web-socket-stomp-connected";

type UseOrderExecutionMachineStompOptions = {
    enabled: boolean;
    /** Код машины из комбобокса (`PR120`, `LM210`) — destinations `…/variables/{code}` и `…/{code}Tags`. */
    machineId?: string;
    workAreaId?: string;
    /** Подписка на `{machineId}Tags` — для таблиц технологических параметров («Показать все»). */
    subscribeToTags?: boolean;
};

type StompVariableKind = "parameters" | "tags";

function resolveStompVariableKind(
    destination: string | undefined,
    parametersDestination: string | null,
    tagsDestination: string | null,
): StompVariableKind | null {
    if (!destination) {
        return null;
    }

    if (parametersDestination && destination === parametersDestination) {
        return "parameters";
    }

    if (tagsDestination && destination === tagsDestination) {
        return "tags";
    }

    return null;
}

export function useOrderExecutionMachineStomp({
    enabled,
    machineId,
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
    }, [machineId, workAreaId]);

    useEffect(() => {
        const parametersDestination = buildOrderExecutionMachineParametersStompDestination(
            machineId ?? "",
        );
        const tagsDestination = subscribeToTags
            ? buildOrderExecutionMachineTagsStompDestination(machineId ?? "")
            : null;

        if (!enabled || !parametersDestination) {
            return;
        }

        const destinations = [
            parametersDestination,
            ...(tagsDestination ? [tagsDestination] : []),
        ] as const;

        let disposed = false;
        const subscriptionIds: string[] = [];

        const unwatch = webSocket.onMessage.watch((message: IncomingMessage) => {
            if (disposed) {
                return;
            }

            const kind = resolveStompVariableKind(
                message.headers.destination,
                parametersDestination,
                tagsDestination,
            );
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
        // Подписка только по выбранной машине; workAreaId меняется после загрузки этапа
        // и не должен вызывать повторный SUBSCRIBE на тот же destination.
    }, [enabled, machineId, subscribeToTags]);

    const state: OrderExecutionMachineStompState = {
        snapshot,
        tagsSnapshot,
        isStompConnected,
        hasReceivedStompData,
        hasReceivedTagsData,
    };

    return state;
}
