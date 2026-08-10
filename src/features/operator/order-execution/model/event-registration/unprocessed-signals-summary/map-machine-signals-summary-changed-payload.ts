import { buildUnprocessedSignalsSummarySnapshot } from "./build-unprocessed-signals-summary-snapshot";
import type { UnprocessedSignalsSummarySnapshot } from "./types";

function parseMaybeNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) {
            return undefined;
        }
        const parsed = Number(trimmed);
        if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return undefined;
}

function parseMaybeString(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    return undefined;
}

function parseKeyValuePairs(input: string): Record<string, string> {
    const pairs: Record<string, string> = {};
    const regex = /([a-zA-Z0-9_]+)=([^,]+)/g;
    let match: RegExpExecArray | null = null;
    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(input)) !== null) {
        const key = match[1];
        const value = match[2].trim();
        pairs[key] = value;
    }
    return pairs;
}

/**
 * STOMP `machineSignalsSummaryChanged` — JSON-массив с одним элементом сводки:
 * `[{ unprocessed_count, processed_count, total_count, work_area_id, changed_at }]`.
 */
function parseSummaryRecord(payload: unknown): Record<string, unknown> | null {
    let normalized: unknown = payload;
    if (typeof normalized === "string") {
        const trimmed = normalized.trim();
        if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
            try {
                normalized = JSON.parse(trimmed) as unknown;
            } catch {
                return null;
            }
        }
    }

    if (Array.isArray(normalized)) {
        if (normalized.length === 0) {
            return null;
        }
        normalized = normalized[0];
    }

    if (!normalized || typeof normalized !== "object") {
        return null;
    }

    const record = normalized as Record<string, unknown>;
    const rawChangedAt = record.changed_at ?? record.changedAt;
    const rawChangedAtString = typeof rawChangedAt === "string" ? rawChangedAt : undefined;

    const hasCompositePairs =
        rawChangedAtString?.includes("work_area_id=") && rawChangedAtString.includes("unprocessed_count=");

    if (rawChangedAtString && hasCompositePairs) {
        const pairs = parseKeyValuePairs(rawChangedAtString);
        const nestedChangedAt = pairs.changed_at || pairs.changedAt;
        const changedAt =
            nestedChangedAt && !nestedChangedAt.includes("=") ? nestedChangedAt : undefined;

        return {
            work_area_id: pairs.work_area_id,
            unprocessed_count: parseMaybeNumber(pairs.unprocessed_count),
            processed_count: parseMaybeNumber(pairs.processed_count),
            total_count: parseMaybeNumber(pairs.total_count),
            changed_at: changedAt,
        };
    }

    return record;
}

export function mapMachineSignalsSummaryChangedPayload(
    payload: unknown,
): UnprocessedSignalsSummarySnapshot | null {
    const record = parseSummaryRecord(payload);
    if (!record) {
        return null;
    }

    const unprocessedCount = parseMaybeNumber(record.unprocessed_count ?? record.unprocessedCount);
    const processedCount = parseMaybeNumber(record.processed_count ?? record.processedCount);

    if (unprocessedCount === undefined || processedCount === undefined) {
        return null;
    }

    return buildUnprocessedSignalsSummarySnapshot(record);
}

export function readMachineSignalsSummaryChangedWorkAreaId(payload: unknown): string | undefined {
    const record = parseSummaryRecord(payload);
    if (!record) {
        return undefined;
    }

    return parseMaybeString(record.work_area_id ?? record.workAreaId);
}
