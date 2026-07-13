import type { MachineDataPanelRow } from "@/shared/ui/kit/machine-data-panel";

export type OrderExecutionMachineDataRow = MachineDataPanelRow;

export type OrderExecutionMachineDataSnapshot = {
    rows: OrderExecutionMachineDataRow[];
    fields: Record<string, unknown>;
    updatedAt: string | null;
};

export type OrderExecutionMachineStompState = {
    /** Переменная STOMP `parameters` — синхронизация и общие параметры машины. */
    snapshot: OrderExecutionMachineDataSnapshot;
    /** Переменная STOMP `tags` — текущие значения для таблиц технологических параметров. */
    tagsSnapshot: OrderExecutionMachineDataSnapshot;
    isStompConnected: boolean;
    /** Получено сообщение по `parameters`. */
    hasReceivedStompData: boolean;
    /** Получено сообщение по `tags`. */
    hasReceivedTagsData: boolean;
};

export const ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER_ROWS: OrderExecutionMachineDataRow[] = [
    { characteristic: "Метраж", value: "—", unit: "—" },
    { characteristic: "Скорость машины", value: "—", unit: "—" },
];

export const ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER: OrderExecutionMachineDataSnapshot = {
    rows: ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER_ROWS,
    fields: {},
    updatedAt: null,
};

export const ORDER_EXECUTION_MACHINE_STOMP_PLACEHOLDER: OrderExecutionMachineStompState = {
    snapshot: ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER,
    tagsSnapshot: ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER,
    isStompConnected: false,
    hasReceivedStompData: false,
    hasReceivedTagsData: false,
};

export function hasOrderExecutionMachineStompData(snapshot: OrderExecutionMachineDataSnapshot): boolean {
    if (snapshot.updatedAt) {
        return true;
    }

    if (Object.keys(snapshot.fields).length > 0) {
        return true;
    }

    return snapshot.rows.some((row) => row.value !== "—");
}
