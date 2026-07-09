import type { ApiSchemas } from "@/shared/api/schema";

export type EventRegistrationProcessJournalBodyParams = {
    workAreaId: string;
};

export function buildEventRegistrationProcessJournalBody(
    params: EventRegistrationProcessJournalBodyParams,
): ApiSchemas["OrderExecutionProductionEventProcessJournalRequest"] {
    return [
        {
            workAreaId: params.workAreaId,
        },
    ];
}
