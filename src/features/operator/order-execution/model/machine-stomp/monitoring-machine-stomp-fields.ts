export type MonitoringMachineStompFieldKind = "sync_status" | "boolean" | "number";

export type MonitoringMachineStompField = {
    key: string;
    label: string;
    kind: MonitoringMachineStompFieldKind;
};

export const MONITORING_MACHINE_STOMP_FIELDS: MonitoringMachineStompField[] = [
    { key: "sync_status", label: "Статус синхронизации", kind: "sync_status" },
    { key: "machine_in_production", label: "Машина в печати", kind: "boolean" },
    { key: "reel_countmeter", label: "Активный рулон, м", kind: "number" },
    { key: "main_motor_speed", label: "Скорость машины (факт) [м/мин]", kind: "number" },
    { key: "main_motor_set_speed", label: "Скорость машины (установка) [м/мин]", kind: "number" },
    { key: "order_countmeter", label: "Счетчик заказа, м", kind: "number" },
];
