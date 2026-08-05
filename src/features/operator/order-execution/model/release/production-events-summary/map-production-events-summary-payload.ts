import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickString } from "../map-release-rpc-utils";
import { buildReleaseProductionEventsSummarySnapshot } from "./build-release-production-events-summary-snapshot";
import {
    RELEASE_PRODUCTION_EVENTS_SUMMARY_DEFAULT_FIELDS,
    RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY,
    type ReleaseProductionEventsSummarySnapshot,
} from "./types";

function mapFieldLabels(raw: unknown): Array<{ key: string; label: string }> {
    if (!Array.isArray(raw) || raw.length === 0) {
        return [...RELEASE_PRODUCTION_EVENTS_SUMMARY_DEFAULT_FIELDS];
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

    return fields.length > 0 ? fields : [...RELEASE_PRODUCTION_EVENTS_SUMMARY_DEFAULT_FIELDS];
}

export function mapProductionEventsSummaryPayload(
    payload: ApiSchemas["OrderExecutionReleaseProductionEventsSummaryResponse"] | undefined,
): ReleaseProductionEventsSummarySnapshot {
    const fallbackMessage = "Не удалось загрузить сводку событий выпуска";
    const wrapper = payload?.[0] as Record<string, unknown> | undefined;
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultRaw = wrapper?.result;
    if (!Array.isArray(resultRaw) || resultRaw.length === 0) {
        return RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY;
    }

    const resultItem = resultRaw[0];
    if (!resultItem || typeof resultItem !== "object") {
        return RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY;
    }

    const record = resultItem as Record<string, unknown>;
    const fieldLabels = mapFieldLabels(
        (wrapper as Record<string, unknown>).result_field_labels ??
            (wrapper as Record<string, unknown>).resultFieldLabels,
    );
    return buildReleaseProductionEventsSummarySnapshot(record, fieldLabels);
}
