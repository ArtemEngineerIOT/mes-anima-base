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
        const first = normalized[0];
        if (!first || typeof first !== "object") {
            return null;
        }
        return first as Record<string, unknown>;
    }

    if (normalized && typeof normalized === "object") {
        return normalized as Record<string, unknown>;
    }

    return null;
}

export function mapMachineSignalsSummaryChangedPayload(
    payload: unknown,
): UnprocessedSignalsSummarySnapshot | null {
    const record = parseSummaryRecord(payload);
    if (!record) {
        return null;
    }

    const totalCount = parseMaybeNumber(record.total_count ?? record.totalCount);
    const hasSummary = Array.isArray(record.summary);

    if (totalCount === undefined && !hasSummary) {
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
