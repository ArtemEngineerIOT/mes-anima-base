import type { ApiSchemas } from "@/shared/api/schema";

export type EventRegistrationDiscardSignalsBodyParams = {
    workAreaId: string;
    signalIds: string[];
    comment: string;
};

export function buildEventRegistrationDiscardSignalsBody(
    params: EventRegistrationDiscardSignalsBodyParams,
): ApiSchemas["OrderExecutionProductionEventWizardDiscardSignalsRequest"] {
    return [
        {
            workAreaId: params.workAreaId,
            signalIds: params.signalIds.join(","),
            comment: params.comment,
        },
    ];
}
