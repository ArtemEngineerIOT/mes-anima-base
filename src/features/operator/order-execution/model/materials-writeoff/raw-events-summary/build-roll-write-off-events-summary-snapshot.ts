import { pickNullableNumber, pickNumber, pickString } from "../../release/map-release-rpc-utils";
import {
    ROLL_WRITE_OFF_EVENTS_SUMMARY_DEFAULT_FIELDS,
    type RollWriteOffEventsSummaryField,
    type RollWriteOffEventsSummarySnapshot,
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
): RollWriteOffEventsSummaryField[] {
    return fieldLabels.map((field) => ({
        key: field.key,
        label: field.label,
        value: readFieldValue(resultItem, field.key),
    }));
}

function pickChangedAt(record: Record<string, unknown>): string | null {
    return (
        pickString(
            record.changed_at ??
                record.changedAt ??
                record.last_event_at ??
                record.lastEventAt ??
                record.updated_at ??
                record.updatedAt ??
                record.timestamp,
        ) ?? null
    );
}

export function buildRollWriteOffEventsSummarySnapshot(
    record: Record<string, unknown>,
    fieldLabels: Array<{ key: string; label: string }> = [...ROLL_WRITE_OFF_EVENTS_SUMMARY_DEFAULT_FIELDS],
): RollWriteOffEventsSummarySnapshot {
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
        changedAt: pickChangedAt(record),
        fields,
    };
}
