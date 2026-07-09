import type { ApiSchemas } from "@/shared/api/schema";

import { assertEventRegistrationRpcOk, pickBoolean, pickString } from "./map-event-registration-rpc-utils";

export type EventRegistrationRegisterEventMapped = {
    productionEventId: string | null;
    registrationStatus: string | null;
    registrationStatusLabel: string | null;
    processJournalRefreshHint: boolean;
};

export function mapEventRegistrationRegisterEventPayload(
    payload: ApiSchemas["OrderExecutionProductionEventRegisterResponse"] | undefined,
): EventRegistrationRegisterEventMapped {
    const fallbackMessage = "Не удалось зарегистрировать событие";
    const wrapper = payload?.[0];
    assertEventRegistrationRpcOk(wrapper, fallbackMessage);

    const resultItem = (wrapper?.result?.[0] ?? {}) as Record<string, unknown>;

    return {
        productionEventId:
            pickString(resultItem.production_event_id ?? resultItem.productionEventId) ?? null,
        registrationStatus:
            pickString(resultItem.registration_status ?? resultItem.registrationStatus) ?? null,
        registrationStatusLabel:
            pickString(
                resultItem.registration_status_label ?? resultItem.registrationStatusLabel,
            ) ?? null,
        processJournalRefreshHint: pickBoolean(
            resultItem.process_journal_refresh_hint ?? resultItem.processJournalRefreshHint,
        ),
    };
}
