import type { InformerPillVariant } from "@/shared/ui/kit/informer-pill";
import type { InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";

import type { MonitoringStat } from "../types";
import { DEVICE_SYNC_CHARACTERISTIC, resolveDeviceSyncStatus } from "./device-sync-status";
import { MONITORING_MACHINE_STOMP_FIELDS } from "./monitoring-machine-stomp-fields";
import type { OrderExecutionMachineStompState } from "./order-execution-machine-data";

export type ResolvedMonitoringMachineParam = MonitoringStat & {
    showAsPill?: boolean;
    informerTone?: InformerTone;
    pillVariant?: InformerPillVariant;
};

const MONITORING_NUMBER_FORMAT = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
});

const STOMP_DISCONNECTED_BADGE = "Нет соединения со STOMP";

function pickNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return undefined;
}

function formatMonitoringBoolean(value: unknown): string {
    if (typeof value === "boolean") {
        return value ? "Да" : "Нет";
    }
    if (value === 1 || value === "1" || value === "true") {
        return "Да";
    }
    if (value === 0 || value === "0" || value === "false") {
        return "Нет";
    }
    if (value === undefined || value === null || value === "") {
        return "—";
    }
    return String(value);
}

function formatMonitoringNumber(value: unknown): string {
    const number = pickNumber(value);
    if (number === undefined) {
        return "—";
    }
    return MONITORING_NUMBER_FORMAT.format(number);
}

function resolveDisconnectedSyncStatusParam(): ResolvedMonitoringMachineParam {
    return {
        label: DEVICE_SYNC_CHARACTERISTIC,
        value: STOMP_DISCONNECTED_BADGE,
        showAsPill: true,
        informerTone: "alert",
        pillVariant: "outline",
    };
}

function resolveConnectedFieldParam(
    field: (typeof MONITORING_MACHINE_STOMP_FIELDS)[number],
    rawValue: unknown,
): ResolvedMonitoringMachineParam {
    if (field.kind === "sync_status") {
        const status = resolveDeviceSyncStatus(rawValue);
        return {
            label: field.label,
            value: status.label,
            showAsPill: true,
            informerTone: status.informerTone,
            pillVariant: status.pillVariant,
        };
    }

    if (field.kind === "boolean") {
        return {
            label: field.label,
            value: formatMonitoringBoolean(rawValue),
        };
    }

    return {
        label: field.label,
        value: formatMonitoringNumber(rawValue),
    };
}

export function resolveMonitoringMachineParams(
    stompState: OrderExecutionMachineStompState,
): ResolvedMonitoringMachineParam[] {
    if (!stompState.isStompConnected) {
        return MONITORING_MACHINE_STOMP_FIELDS.map((field) => {
            if (field.kind === "sync_status") {
                return resolveDisconnectedSyncStatusParam();
            }

            return {
                label: field.label,
                value: "—",
            };
        });
    }

    const { fields } = stompState.snapshot;

    return MONITORING_MACHINE_STOMP_FIELDS.map((field) =>
        resolveConnectedFieldParam(field, fields[field.key]),
    );
}
