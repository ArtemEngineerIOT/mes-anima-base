import type { ApiSchemas } from "@/shared/api/schema";

import { mapUnprocessedSignals } from "./map-event-registration-init-wizard-payload";
import { assertEventRegistrationRpcOk } from "./map-event-registration-rpc-utils";
import type { UnprocessedMachineEvent } from "./types";

function isUnprocessedSignalRow(value: unknown): value is Record<string, unknown> {
    if (!value || typeof value !== "object") {
        return false;
    }

    const record = value as Record<string, unknown>;
    return (
        record.signal_id != null ||
        record.signalId != null ||
        record.signal_name != null ||
        record.signalName != null
    );
}

/**
 * `listUnprocessedSignals`: строки в `result[]` напрямую
 * или устаревшая обёртка `result[0].unprocessed_signals`.
 */
function readUnprocessedSignalsFromListResult(result: unknown): unknown {
    if (!Array.isArray(result) || result.length === 0) {
        return [];
    }

    const first = result[0];
    if (!first || typeof first !== "object") {
        return [];
    }

    const record = first as Record<string, unknown>;
    const nested = record.unprocessed_signals ?? record.unprocessedSignals;
    if (Array.isArray(nested)) {
        return nested;
    }

    if (isUnprocessedSignalRow(record)) {
        return result;
    }

    return [];
}

/**
 * Ответ `listUnprocessedSignals` — таблица необработанных сигналов машины.
 */
export function mapListUnprocessedSignalsPayload(
    payload: ApiSchemas["OrderExecutionListUnprocessedSignalsResponse"] | undefined,
): UnprocessedMachineEvent[] {
    const fallbackMessage = "Не удалось загрузить необработанные сигналы машины";
    const wrapper = payload?.[0];
    assertEventRegistrationRpcOk(wrapper, fallbackMessage);

    return mapUnprocessedSignals(readUnprocessedSignalsFromListResult(wrapper?.result), []);
}
