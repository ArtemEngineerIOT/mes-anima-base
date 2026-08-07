import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickString } from "../../release/map-release-rpc-utils";
import { buildRollWriteOffEventsSummarySnapshot } from "./build-roll-write-off-events-summary-snapshot";
import {
    ROLL_WRITE_OFF_EVENTS_SUMMARY_DEFAULT_FIELDS,
    ROLL_WRITE_OFF_EVENTS_SUMMARY_EMPTY,
    type RollWriteOffEventsSummarySnapshot,
} from "./types";

function mapFieldLabels(raw: unknown): Array<{ key: string; label: string }> {
    if (!Array.isArray(raw) || raw.length === 0) {
        return [...ROLL_WRITE_OFF_EVENTS_SUMMARY_DEFAULT_FIELDS];
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

    return fields.length > 0 ? fields : [...ROLL_WRITE_OFF_EVENTS_SUMMARY_DEFAULT_FIELDS];
}

export function mapRollWriteOffEventsSummaryPayload(
    payload: ApiSchemas["OrderExecutionRollWriteOffEventsSummaryResponse"] | undefined,
): RollWriteOffEventsSummarySnapshot {
    const fallbackMessage = "Не удалось загрузить сводку событий списания";
    const wrapper = payload?.[0] as Record<string, unknown> | undefined;
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultRaw = wrapper?.result;
    if (!Array.isArray(resultRaw) || resultRaw.length === 0) {
        return ROLL_WRITE_OFF_EVENTS_SUMMARY_EMPTY;
    }

    const resultItem = resultRaw[0];
    if (!resultItem || typeof resultItem !== "object") {
        return ROLL_WRITE_OFF_EVENTS_SUMMARY_EMPTY;
    }

    const record = resultItem as Record<string, unknown>;
    const fieldLabels = mapFieldLabels(
        wrapper?.result_field_labels ?? wrapper?.resultFieldLabels,
    );
    return buildRollWriteOffEventsSummarySnapshot(record, fieldLabels);
}
