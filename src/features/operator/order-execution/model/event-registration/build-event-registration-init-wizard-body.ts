import type { ApiSchemas } from "@/shared/api/schema";

export type EventRegistrationInitWizardBodyParams = {
    workAreaId: string;
    operatorRef: string;
};

export function buildEventRegistrationInitWizardBody(
    params: EventRegistrationInitWizardBodyParams,
): ApiSchemas["OrderExecutionProductionEventWizardInitRequest"] {
    return [
        {
            workAreaId: params.workAreaId,
            operatorRef: params.operatorRef,
        },
    ];
}
