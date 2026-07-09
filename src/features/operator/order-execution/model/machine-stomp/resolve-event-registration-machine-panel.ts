import type { MachineDataPanelRow } from "@/shared/ui/kit/machine-data-panel";
import type { InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";

import { resolveDeviceSyncStatus } from "./device-sync-status";
import {
    EVENT_REGISTRATION_MACHINE_STOMP_FIELDS,
    type EventRegistrationMachineStompFieldFormat,
} from "./event-registration-machine-stomp-fields";
import type { OrderExecutionMachineStompState } from "./order-execution-machine-data";

const MACHINE_STOMP_NUMBER_FORMAT = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
});

const MACHINE_STOMP_INTEGER_FORMAT = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
});

const DISCONNECTED_PANEL_TONE: InformerTone = "alert";
const DEFAULT_PANEL_TONE: InformerTone = "success";

export type EventRegistrationMachinePanel = {
    rows: MachineDataPanelRow[];
    tone: InformerTone;
    updatedAt: string | null;
};

function pickNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return undefined;
}

function formatMachineStompValue(value: unknown, format: EventRegistrationMachineStompFieldFormat): string {
    const number = pickNumber(value);
    if (number === undefined) {
        return "—";
    }

    if (format === "integer") {
        return MACHINE_STOMP_INTEGER_FORMAT.format(Math.round(number));
    }

    return MACHINE_STOMP_NUMBER_FORMAT.format(number);
}

function resolvePanelTone(stompState: OrderExecutionMachineStompState): InformerTone {
    if (!stompState.isStompConnected) {
        return DISCONNECTED_PANEL_TONE;
    }

    const syncStatus = stompState.snapshot.fields.sync_status;
    if (syncStatus === undefined) {
        return DEFAULT_PANEL_TONE;
    }

    return resolveDeviceSyncStatus(syncStatus).informerTone;
}

function resolveFieldValue(
    stompState: OrderExecutionMachineStompState,
    rawValue: unknown,
    format: EventRegistrationMachineStompFieldFormat,
): string {
    if (!stompState.isStompConnected) {
        return "—";
    }

    return formatMachineStompValue(rawValue, format);
}

export function resolveEventRegistrationMachinePanel(
    stompState: OrderExecutionMachineStompState,
): EventRegistrationMachinePanel {
    const { fields, updatedAt } = stompState.snapshot;

    const rows: MachineDataPanelRow[] = EVENT_REGISTRATION_MACHINE_STOMP_FIELDS.map((field) => ({
        characteristic: field.label,
        value: resolveFieldValue(stompState, fields[field.key], field.format),
        unit: stompState.isStompConnected ? field.unit : "—",
    }));

    return {
        rows,
        tone: resolvePanelTone(stompState),
        updatedAt,
    };
}
