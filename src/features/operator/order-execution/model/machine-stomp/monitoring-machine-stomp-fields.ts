import { DEVICE_SYNC_FIELD_KEY } from "./device-sync-status";

export type MonitoringMachineStompFieldKind = "sync_status" | "boolean" | "number";

export type MonitoringMachineStompField = {
    key: string;
    label: string;
    kind: MonitoringMachineStompFieldKind;
};

/** PR120 — текущий набор параметров мониторинга. */
export const MONITORING_MACHINE_STOMP_FIELDS_PR120: MonitoringMachineStompField[] = [
    { key: DEVICE_SYNC_FIELD_KEY, label: "Статус синхронизации", kind: "sync_status" },
    { key: "machine_in_production", label: "Машина в печати", kind: "boolean" },
    { key: "reel_countmeter", label: "Активный рулон, м", kind: "number" },
    { key: "main_motor_speed", label: "Скорость машины (факт) [м/мин]", kind: "number" },
    { key: "main_motor_set_speed", label: "Скорость машины (установка) [м/мин]", kind: "number" },
    { key: "order_countmeter", label: "Счетчик заказа, м", kind: "number" },
];

/** LM210 — параметры из STOMP `lm210` / descriptions. */
export const MONITORING_MACHINE_STOMP_FIELDS_LM210: MonitoringMachineStompField[] = [
    { key: DEVICE_SYNC_FIELD_KEY, label: "Статус синхронизации", kind: "sync_status" },
    { key: "line_speed_set", label: "Скорость (уставка), м/мин", kind: "number" },
    { key: "speed_act_value", label: "Скорость (факт), м/мин", kind: "number" },
    { key: "tension_act_unwa", label: "Размотка A: натяжение (факт), N", kind: "number" },
    { key: "tension_act_unwb", label: "Размотка B: натяжение (факт), N", kind: "number" },
    { key: "tension_act_win", label: "Намотка: натяжение (факт), N", kind: "number" },
    { key: "lc_a_tens_act", label: "Ламинатор: натяжение LC1 (факт), N", kind: "number" },
    { key: "lc_b_tens_act", label: "Ламинатор: натяжение LC2 (факт), N", kind: "number" },
    { key: "lc_c_tens_act", label: "Ламинатор: натяжение LC3 (факт), N", kind: "number" },
];

const MONITORING_FIELDS_BY_MACHINE: Record<string, MonitoringMachineStompField[]> = {
    PR120: MONITORING_MACHINE_STOMP_FIELDS_PR120,
    LM210: MONITORING_MACHINE_STOMP_FIELDS_LM210,
};

/** @deprecated Используйте {@link getMonitoringMachineStompFields}. */
export const MONITORING_MACHINE_STOMP_FIELDS = MONITORING_MACHINE_STOMP_FIELDS_PR120;

/** Список строк «Данные с машины» для выбранного `machineId` / resourceCode. */
export function getMonitoringMachineStompFields(machineId: string | undefined): MonitoringMachineStompField[] {
    const code = machineId?.trim().toUpperCase();
    if (!code) {
        return MONITORING_MACHINE_STOMP_FIELDS_PR120;
    }

    return MONITORING_FIELDS_BY_MACHINE[code] ?? MONITORING_MACHINE_STOMP_FIELDS_PR120;
}
