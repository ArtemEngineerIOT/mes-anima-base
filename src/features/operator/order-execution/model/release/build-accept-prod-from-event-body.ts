import type { ApiSchemas } from "@/shared/api/schema";

export function buildAcceptProdFromEventBody(params: {
    workAreaId: string;
    machineEventSignalId: string;
    operatorRef?: string;
}): ApiSchemas["OrderExecutionAcceptProdFromEventRequest"] {
    return [
        {
            workAreaId: params.workAreaId,
            machineEventSignalId: params.machineEventSignalId,
            ...(params.operatorRef ? { operatorRef: params.operatorRef } : {}),
        },
    ];
}
