import type { OrderExecutionMachineDataSnapshot } from "./order-execution-machine-data";
import { ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER } from "./order-execution-machine-data";
import {
    isDeviceSyncFieldKey,
    normalizeDeviceSyncFieldKey,
    resolveDeviceSyncStatus,
    DEVICE_SYNC_CHARACTERISTIC,
} from "./device-sync-status";
import { mapOrderExecutionMachineStompField } from "./map-order-execution-machine-stomp-field";

function pickString(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    return undefined;
}

function pickNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return undefined;
}

function formatNumber(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

function mapUpdatesRecord(updates: Record<string, unknown>, timestamp: string | null): OrderExecutionMachineDataSnapshot {
    const fields: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(updates)) {
        fields[normalizeDeviceSyncFieldKey(key)] = value;
    }

    const rows = Object.entries(fields).map(([key, value]) => mapOrderExecutionMachineStompField(key, value));

    return {
        rows: rows.length > 0 ? rows : ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER.rows,
        fields,
        updatedAt: timestamp,
    };
}

function mapStompValuePayload(body: unknown): OrderExecutionMachineDataSnapshot | null {
    if (!Array.isArray(body)) {
        return null;
    }

    const first = body[0];
    if (!first || typeof first !== "object") {
        return null;
    }

    const value = (first as Record<string, unknown>).value;
    if (!Array.isArray(value)) {
        return null;
    }

    const firstValue = value[0];
    if (!firstValue || typeof firstValue !== "object") {
        return null;
    }

    const valueRecord = firstValue as Record<string, unknown>;
    const timestamp = pickString(valueRecord.timestamp) ?? null;
    const updates = valueRecord.updates;
    const firstUpdate = Array.isArray(updates) ? updates[0] : updates;

    if (!firstUpdate || typeof firstUpdate !== "object") {
        return {
            rows: ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER.rows,
            fields: {},
            updatedAt: timestamp,
        };
    }

    return mapUpdatesRecord(firstUpdate as Record<string, unknown>, timestamp);
}

export function mapOrderExecutionMachineStompPayload(body: unknown): OrderExecutionMachineDataSnapshot {
    const stompValuePayload = mapStompValuePayload(body);
    if (stompValuePayload) {
        return stompValuePayload;
    }

    if (!body || typeof body !== "object") {
        return ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER;
    }

    const record = body as Record<string, unknown>;
    const nested = Array.isArray(record.rows)
        ? record.rows
        : Array.isArray(record.machine_data)
          ? record.machine_data
          : null;

    if (nested) {
        const mapped = nested
            .map((row) => {
                if (!row || typeof row !== "object") {
                    return null;
                }
                const item = row as Record<string, unknown>;
                const characteristic = pickString(item.characteristic ?? item.parameter);
                const rawValue = item.value ?? item.current;
                const unit = pickString(item.unit);
                if (!characteristic) {
                    return null;
                }

                if (isDeviceSyncFieldKey(characteristic)) {
                    const status = resolveDeviceSyncStatus(rawValue);
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

                const value = pickString(rawValue);
                return {
                    characteristic,
                    value: value ?? "—",
                    unit: unit ?? "—",
                };
            })
            .filter((row) => row !== null);

        if (mapped.length > 0) {
            return { rows: mapped, fields: {}, updatedAt: null };
        }
    }

    const lengthM = pickNumber(record.current_length_m ?? record.currentLengthM ?? record.meters);
    const machineSpeed = pickNumber(record.machine_speed ?? record.machineSpeed);
    const speedUnit = pickString(record.speed_unit ?? record.speedUnit) ?? "м / мин.";
    const deviceSyncEntry = Object.entries(record).find(([key]) => isDeviceSyncFieldKey(key));

    const rows = [
        ...(deviceSyncEntry ? [mapOrderExecutionMachineStompField(deviceSyncEntry[0], deviceSyncEntry[1])] : []),
        {
            characteristic: "Метраж",
            value: lengthM !== undefined ? formatNumber(lengthM) : "—",
            unit: lengthM !== undefined ? pickString(record.length_uom ?? record.lengthUom) ?? "м" : "—",
        },
        {
            characteristic: "Скорость машины",
            value: machineSpeed !== undefined ? formatNumber(machineSpeed) : "—",
            unit: machineSpeed !== undefined ? speedUnit : "—",
        },
    ];

    if (lengthM === undefined && machineSpeed === undefined && !deviceSyncEntry) {
        return ORDER_EXECUTION_MACHINE_DATA_PLACEHOLDER;
    }

    return {
        rows,
        fields: {},
        updatedAt: pickString(record.timestamp) ?? null,
    };
}

export const ORDER_EXECUTION_MACHINE_STOMP_DESTINATION =
    "/v1/contexts/users.admin.models.stomp/variables/parameters";
