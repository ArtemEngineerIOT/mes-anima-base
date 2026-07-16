import type { ApiSchemas } from "@/shared/api/schema";

export function buildDiscardProductionEventBody(params: {
    workAreaId: string;
    machineEventSignalId: string;
    operatorRef?: string;
}): ApiSchemas["OrderExecutionDiscardProductionEventRequest"] {
    return [
        {
            workAreaId: params.workAreaId,
            machineEventSignalId: params.machineEventSignalId,
            ...(params.operatorRef ? { operatorRef: params.operatorRef } : {}),
        },
    ];
}
