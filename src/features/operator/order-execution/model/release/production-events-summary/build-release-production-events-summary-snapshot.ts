import { pickNullableNumber, pickNumber, pickString } from "../map-release-rpc-utils";
import {
    RELEASE_PRODUCTION_EVENTS_SUMMARY_DEFAULT_FIELDS,
    type ReleaseProductionEventsSummaryField,
    type ReleaseProductionEventsSummarySnapshot,
} from "./types";

function readFieldValue(resultItem: Record<string, unknown>, key: string): number {
    if (key in resultItem) {
        return pickNumber(resultItem[key]);
    }

    const camelKey = key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
    return pickNumber(resultItem[camelKey]);
}

function mapSummaryFields(
    resultItem: Record<string, unknown>,
    fieldLabels: Array<{ key: string; label: string }>,
): ReleaseProductionEventsSummaryField[] {
    return fieldLabels.map((field) => ({
        key: field.key,
        label: field.label,
        value: readFieldValue(resultItem, field.key),
    }));
}

export function buildReleaseProductionEventsSummarySnapshot(
    record: Record<string, unknown>,
    fieldLabels: Array<{ key: string; label: string }> = [...RELEASE_PRODUCTION_EVENTS_SUMMARY_DEFAULT_FIELDS],
): ReleaseProductionEventsSummarySnapshot {
    const fields = mapSummaryFields(record, fieldLabels);
    const unprocessedCount = readFieldValue(record, "unprocessed_count");
    const processedCount = readFieldValue(record, "processed_count");
    const explicitTotalCount = pickNullableNumber(record.total_count ?? record.totalCount);

    return {
        unprocessedCount,
        processedCount,
        totalCount:
            explicitTotalCount ??
            (unprocessedCount + processedCount > 0 ? unprocessedCount + processedCount : 0),
        changedAt: pickString(record.changed_at ?? record.changedAt) ?? null,
        fields,
    };
}
