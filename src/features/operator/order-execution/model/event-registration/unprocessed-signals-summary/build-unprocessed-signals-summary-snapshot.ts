import { pickNullableNumber, pickNumber, pickString } from "../../release/map-release-rpc-utils";
import {
    UNPROCESSED_SIGNALS_SUMMARY_DEFAULT_FIELDS,
    UNPROCESSED_SIGNALS_SUMMARY_EMPTY,
    type UnprocessedSignalsSummaryField,
    type UnprocessedSignalsSummarySnapshot,
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
): UnprocessedSignalsSummaryField[] {
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

/** Собирает снимок сводки из `machine_signals_block` / getUnprocessedSignalsSummary / STOMP. */
export function buildUnprocessedSignalsSummarySnapshot(
    record: Record<string, unknown>,
    fieldLabels: Array<{ key: string; label: string }> = [...UNPROCESSED_SIGNALS_SUMMARY_DEFAULT_FIELDS],
): UnprocessedSignalsSummarySnapshot {
    const explicitTotalCount = pickNullableNumber(record.total_count ?? record.totalCount);
    let unprocessedCount = readFieldValue(record, "unprocessed_count");
    let processedCount = readFieldValue(record, "processed_count");

    if (unprocessedCount === 0 && processedCount === 0 && explicitTotalCount !== null && explicitTotalCount > 0) {
        unprocessedCount = explicitTotalCount;
    }

    const fields = mapSummaryFields(
        {
            ...record,
            unprocessed_count: unprocessedCount,
            processed_count: processedCount,
        },
        fieldLabels,
    );

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

export { UNPROCESSED_SIGNALS_SUMMARY_EMPTY };
