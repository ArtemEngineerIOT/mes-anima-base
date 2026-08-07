import type { ApiSchemas } from "@/shared/api/schema";

import { assertEventRegistrationRpcOk } from "../map-event-registration-rpc-utils";
import { buildUnprocessedSignalsSummarySnapshot } from "./build-unprocessed-signals-summary-snapshot";
import {
    UNPROCESSED_SIGNALS_SUMMARY_EMPTY,
    type UnprocessedSignalsSummarySnapshot,
} from "./types";

export { toUnprocessedSignalsSummaryPanelRows } from "./build-unprocessed-signals-summary-snapshot";

export function mapUnprocessedSignalsSummaryPayload(
    payload: ApiSchemas["OrderExecutionUnprocessedSignalsSummaryResponse"] | undefined,
): UnprocessedSignalsSummarySnapshot {
    const fallbackMessage = "Не удалось загрузить сводку сигналов с машины";
    const wrapper = payload?.[0];
    assertEventRegistrationRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    if (!resultItem) {
        return UNPROCESSED_SIGNALS_SUMMARY_EMPTY;
    }

    return buildUnprocessedSignalsSummarySnapshot(resultItem);
}
