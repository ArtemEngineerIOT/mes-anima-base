import type { ApiSchemas } from "@/shared/api/schema";

import type { ProductionPlanMachine } from "./types";

function pickResourceCode(row: Record<string, unknown>): string | undefined {
    const value = row.resourceCode;
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    return undefined;
}

export function mapProductionPlanMachinesPayload(
    payload: ApiSchemas["ProductionPlanMachinesResponse"],
): ProductionPlanMachine[] {
    const machines: ProductionPlanMachine[] = [];
    const seenCodes = new Set<string>();

    for (const row of payload) {
        const record = row as Record<string, unknown>;
        const resourceCode = pickResourceCode(record);

        if (!resourceCode || seenCodes.has(resourceCode)) {
            continue;
        }

        seenCodes.add(resourceCode);
        machines.push({ resourceCode, machine: resourceCode });
    }

    return machines.sort((a, b) => a.machine.localeCompare(b.machine, "ru"));
}
