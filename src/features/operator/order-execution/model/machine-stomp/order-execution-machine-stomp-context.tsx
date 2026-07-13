import { createContext, useContext } from "react";

import {
    ORDER_EXECUTION_MACHINE_STOMP_PLACEHOLDER,
    type OrderExecutionMachineDataSnapshot,
    type OrderExecutionMachineStompState,
} from "./order-execution-machine-data";
import { useOrderExecutionMachineStomp } from "./use-order-execution-machine-stomp";

const OrderExecutionMachineStompContext = createContext<OrderExecutionMachineStompState>(
    ORDER_EXECUTION_MACHINE_STOMP_PLACEHOLDER,
);

type OrderExecutionMachineStompProviderProps = {
    enabled: boolean;
    workAreaId?: string;
    /** Подписка на `tags` (таблицы технологических параметров на «Показать все»). */
    subscribeToTags?: boolean;
    children: React.ReactNode;
};

export function OrderExecutionMachineStompProvider({
    enabled,
    workAreaId,
    subscribeToTags = false,
    children,
}: OrderExecutionMachineStompProviderProps) {
    const stompState = useOrderExecutionMachineStomp({ enabled, workAreaId, subscribeToTags });

    return (
        <OrderExecutionMachineStompContext.Provider value={stompState}>
            {children}
        </OrderExecutionMachineStompContext.Provider>
    );
}

export function useOrderExecutionMachineStompState(): OrderExecutionMachineStompState {
    return useContext(OrderExecutionMachineStompContext);
}

export function useOrderExecutionMachineStompSnapshot(): OrderExecutionMachineDataSnapshot {
    return useContext(OrderExecutionMachineStompContext).snapshot;
}
