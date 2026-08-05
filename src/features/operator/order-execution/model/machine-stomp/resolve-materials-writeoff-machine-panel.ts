import type { MachineDataPanelRow } from "@/shared/ui/kit/machine-data-panel";
import type { InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";

import { MATERIALS_WRITEOFF_MACHINE_STOMP_FIELDS } from "./materials-writeoff-machine-stomp-fields";
import type { OrderExecutionMachineStompState } from "./order-execution-machine-data";
import { resolveMachineStompPanelTone } from "./resolve-machine-stomp-panel-tone";

const MACHINE_STOMP_NUMBER_FORMAT = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
});

export type MaterialsWriteoffMachinePanel = {
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

function formatMachineStompNumber(value: unknown): string {
    const number = pickNumber(value);
    if (number === undefined) {
        return "—";
    }
    return MACHINE_STOMP_NUMBER_FORMAT.format(number);
}

function resolveFieldValue(stompState: OrderExecutionMachineStompState, rawValue: unknown): string {
    if (!stompState.isStompConnected) {
        return "—";
    }

    return formatMachineStompNumber(rawValue);
}

export function resolveMaterialsWriteoffMachinePanel(
    stompState: OrderExecutionMachineStompState,
): MaterialsWriteoffMachinePanel {
    const { fields, updatedAt } = stompState.snapshot;

    const rows: MachineDataPanelRow[] = MATERIALS_WRITEOFF_MACHINE_STOMP_FIELDS.map((field) => ({
        characteristic: field.label,
        value: resolveFieldValue(stompState, fields[field.key]),
        unit: stompState.isStompConnected ? field.unit : "—",
    }));

    return {
        rows,
        tone: resolveMachineStompPanelTone(stompState),
        updatedAt,
    };
}
