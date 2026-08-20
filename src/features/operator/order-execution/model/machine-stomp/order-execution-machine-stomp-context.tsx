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
    /** Код машины из комбобокса фильтров — destination `…/variables/{code.toLowerCase()}`. */
    machineId?: string;
    workAreaId?: string;
    /** Подписка на `{machineId}Tags` (таблицы технологических параметров на «Показать все»). */
    subscribeToTags?: boolean;
    children: React.ReactNode;
};

export function OrderExecutionMachineStompProvider({
    enabled,
    machineId,
    workAreaId,
    subscribeToTags = false,
    children,
}: OrderExecutionMachineStompProviderProps) {
    const stompState = useOrderExecutionMachineStomp({
        enabled,
        machineId,
        workAreaId,
        subscribeToTags,
    });

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
