import type { OrderExecutionMachineDataRow } from "./order-execution-machine-data";
import {
    DEVICE_SYNC_CHARACTERISTIC,
    isDeviceSyncFieldKey,
    resolveDeviceSyncStatus,
} from "./device-sync-status";

function formatValue(value: unknown): string {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
    }
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    if (typeof value === "boolean") {
        return value ? "Да" : "Нет";
    }
    return "—";
}

export function mapOrderExecutionMachineStompField(key: string, value: unknown): OrderExecutionMachineDataRow {
    if (isDeviceSyncFieldKey(key)) {
        const status = resolveDeviceSyncStatus(value);
        return {
            characteristic: DEVICE_SYNC_CHARACTERISTIC,
            value: status.label,
            unit: "—",
            valueDisplay: {
                pill: true as const,
                tone: status.informerTone,
                variant: status.pillVariant,
                drivesPanelTone: true,
            },
        };
    }

    return {
        characteristic: key,
        value: formatValue(value),
        unit: "—",
    };
}
