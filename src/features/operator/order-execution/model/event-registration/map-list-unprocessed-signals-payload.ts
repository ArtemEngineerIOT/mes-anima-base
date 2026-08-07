import type { ApiSchemas } from "@/shared/api/schema";

import { mapUnprocessedSignals } from "./map-event-registration-init-wizard-payload";
import { assertEventRegistrationRpcOk } from "./map-event-registration-rpc-utils";
import type { UnprocessedMachineEvent } from "./types";

/**
 * Ответ `listUnprocessedSignals` — таблица необработанных сигналов машины.
 */
export function mapListUnprocessedSignalsPayload(
    payload: ApiSchemas["OrderExecutionListUnprocessedSignalsResponse"] | undefined,
): UnprocessedMachineEvent[] {
    const fallbackMessage = "Не удалось загрузить необработанные сигналы машины";
    const wrapper = payload?.[0];
    assertEventRegistrationRpcOk(wrapper, fallbackMessage);

    const resultItem = (wrapper?.result?.[0] ?? {}) as Record<string, unknown>;
    return mapUnprocessedSignals(
        resultItem.unprocessed_signals ?? resultItem.unprocessedSignals,
        [],
    );
}
