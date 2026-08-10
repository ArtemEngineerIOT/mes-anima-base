import type { ApiSchemas } from "@/shared/api/schema";

import { assertEventRegistrationRpcOk, pickString } from "../map-event-registration-rpc-utils";
import { buildUnprocessedSignalsSummarySnapshot } from "./build-unprocessed-signals-summary-snapshot";
import {
    UNPROCESSED_SIGNALS_SUMMARY_DEFAULT_FIELDS,
    UNPROCESSED_SIGNALS_SUMMARY_EMPTY,
    type UnprocessedSignalsSummarySnapshot,
} from "./types";

function mapFieldLabels(raw: unknown): Array<{ key: string; label: string }> {
    if (!Array.isArray(raw) || raw.length === 0) {
        return [...UNPROCESSED_SIGNALS_SUMMARY_DEFAULT_FIELDS];
    }

    const fields = raw
        .map((item) => {
            if (!item || typeof item !== "object") {
                return null;
            }

            const record = item as Record<string, unknown>;
            const key = pickString(record.name);
            const label = pickString(record.label);
            if (!key || !label) {
                return null;
            }

            return { key, label };
        })
        .filter((item): item is { key: string; label: string } => item !== null);

    return fields.length > 0 ? fields : [...UNPROCESSED_SIGNALS_SUMMARY_DEFAULT_FIELDS];
}

export function mapUnprocessedSignalsSummaryPayload(
    payload: ApiSchemas["OrderExecutionUnprocessedSignalsSummaryResponse"] | undefined,
): UnprocessedSignalsSummarySnapshot {
    const fallbackMessage = "Не удалось загрузить сводку сигналов с машины";
    const wrapper = payload?.[0] as Record<string, unknown> | undefined;
    assertEventRegistrationRpcOk(wrapper, fallbackMessage);

    const resultRaw = wrapper?.result;
    if (!Array.isArray(resultRaw) || resultRaw.length === 0) {
        return UNPROCESSED_SIGNALS_SUMMARY_EMPTY;
    }

    const resultItem = resultRaw[0];
    if (!resultItem || typeof resultItem !== "object") {
        return UNPROCESSED_SIGNALS_SUMMARY_EMPTY;
    }

    const record = resultItem as Record<string, unknown>;
    const fieldLabels = mapFieldLabels(wrapper?.result_field_labels ?? wrapper?.resultFieldLabels);
    return buildUnprocessedSignalsSummarySnapshot(record, fieldLabels);
}
