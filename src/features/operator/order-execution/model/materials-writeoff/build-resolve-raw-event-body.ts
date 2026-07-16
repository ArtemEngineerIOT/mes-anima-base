import type { ApiSchemas } from "@/shared/api/schema";

type ResolveRawEventBodyParams = {
    workAreaId: string;
    machineEventSignalId: string;
    operatorRef?: string;
};

function buildResolveRawEventBodyItem(params: ResolveRawEventBodyParams) {
    return {
        workAreaId: params.workAreaId,
        machineEventSignalId: params.machineEventSignalId,
        ...(params.operatorRef ? { operatorRef: params.operatorRef } : {}),
    };
}

export function buildDiscardEventRollBody(
    params: ResolveRawEventBodyParams,
): ApiSchemas["OrderExecutionDiscardProductionEventRequest"] {
    return [buildResolveRawEventBodyItem(params)];
}

export function buildAcceptRawFromEventBody(
    params: ResolveRawEventBodyParams,
): ApiSchemas["OrderExecutionAcceptProdFromEventRequest"] {
    return [buildResolveRawEventBodyItem(params)];
}
