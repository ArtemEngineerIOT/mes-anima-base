import type { ProductionPlanMachine } from "@/features/operator/production-plan/model/types";

import { MATERIAL_ORDER_RESOURCE_CODE } from "./constants";

export function sortMaterialOrderMachineCodes(
    machineOptions: ProductionPlanMachine[],
    codes: string[],
): string[] {
    const orderIndex = new Map(machineOptions.map((item, index) => [item.resourceCode, index]));

    return [...codes].sort((a, b) => {
        const indexA = orderIndex.get(a) ?? Number.MAX_SAFE_INTEGER;
        const indexB = orderIndex.get(b) ?? Number.MAX_SAFE_INTEGER;
        return indexA - indexB;
    });
}

export function pickDefaultMaterialOrderMachineCodes(
    machineOptions: ProductionPlanMachine[],
    current: string[],
): string[] {
    const validCurrent = current.filter((code) =>
        machineOptions.some((item) => item.resourceCode === code),
    );
    if (validCurrent.length > 0) {
        return sortMaterialOrderMachineCodes(machineOptions, validCurrent);
    }

    const preferred = machineOptions.find((item) => item.resourceCode === MATERIAL_ORDER_RESOURCE_CODE);
    const fallback = preferred?.resourceCode ?? machineOptions[0]?.resourceCode;
    return fallback ? [fallback] : [];
}

export function toggleMaterialOrderMachineSelection(
    machineOptions: ProductionPlanMachine[],
    current: string[],
    resourceCode: string,
): string[] {
    if (current.includes(resourceCode)) {
        if (current.length <= 1) {
            return current;
        }

        return sortMaterialOrderMachineCodes(
            machineOptions,
            current.filter((code) => code !== resourceCode),
        );
    }

    return sortMaterialOrderMachineCodes(machineOptions, [...current, resourceCode]);
}
