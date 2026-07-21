import type { ApiSchemas } from "@/shared/api/schema";

import { assertEventRegistrationRpcOk, pickNumber } from "./map-event-registration-rpc-utils";

export type EventRegistrationDiscardSignalsMapped = {
    discardedCount: number;
};

/** Проверка ответа discard; список необработанных после удаления берём из initProductionEventWizard. */
export function mapEventRegistrationDiscardSignalsPayload(
    payload: ApiSchemas["OrderExecutionProductionEventWizardDiscardSignalsResponse"] | undefined,
): EventRegistrationDiscardSignalsMapped {
    const fallbackMessage = "Не удалось удалить необработанные сигналы";
    const wrapper = payload?.[0];
    assertEventRegistrationRpcOk(wrapper, fallbackMessage);

    const resultItem = (wrapper?.result?.[0] ?? {}) as Record<string, unknown>;
    const discardedCount =
        pickNumber(resultItem.discarded_count ?? resultItem.discardedCount) ?? 0;

    return {
        discardedCount,
    };
}
