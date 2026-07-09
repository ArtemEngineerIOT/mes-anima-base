import type { ApiSchemas } from "@/shared/api/schema";

import { mapUnprocessedSignals } from "./map-event-registration-init-wizard-payload";
import { assertEventRegistrationRpcOk, pickNumber } from "./map-event-registration-rpc-utils";
import type { UnprocessedMachineEvent } from "./types";

export type EventRegistrationDiscardSignalsMapped = {
    discardedCount: number;
    unprocessedEvents: UnprocessedMachineEvent[];
};

export function mapEventRegistrationDiscardSignalsPayload(
    payload: ApiSchemas["OrderExecutionProductionEventWizardDiscardSignalsResponse"] | undefined,
    fallback: UnprocessedMachineEvent[],
): EventRegistrationDiscardSignalsMapped {
    const fallbackMessage = "Не удалось удалить необработанные сигналы";
    const wrapper = payload?.[0];
    assertEventRegistrationRpcOk(wrapper, fallbackMessage);

    const resultItem = (wrapper?.result?.[0] ?? {}) as Record<string, unknown>;
    const discardedCount =
        pickNumber(resultItem.discarded_count ?? resultItem.discardedCount) ?? 0;
    const unprocessedEvents = mapUnprocessedSignals(
        resultItem.unprocessed_signals ?? resultItem.unprocessedSignals,
        fallback,
    );

    return {
        discardedCount,
        unprocessedEvents,
    };
}
