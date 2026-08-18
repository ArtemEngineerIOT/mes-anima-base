import { buildStageCompletionReadinessSnapshot } from "./build-stage-completion-readiness-snapshot";
import type { StageCompletionReadinessSnapshot } from "./types";

function parseMaybeString(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    return undefined;
}

/**
 * STOMP `stageCompletionReadinessChanged` — JSON-массив с одним элементом сводки:
 * `[{ work_area_id, blocking_issues, can_complete, blocker_count, changed_at }]`.
 */
function parseReadinessRecord(payload: unknown): Record<string, unknown> | null {
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

    return normalized as Record<string, unknown>;
}

export function mapStageCompletionReadinessChangedPayload(
    payload: unknown,
): StageCompletionReadinessSnapshot | null {
    const record = parseReadinessRecord(payload);
    if (!record) {
        return null;
    }

    const hasCanComplete = record.can_complete !== undefined || record.canComplete !== undefined;
    const hasIssues = record.blocking_issues !== undefined || record.blockingIssues !== undefined;
    const hasBlockerCount = record.blocker_count !== undefined || record.blockerCount !== undefined;

    if (!hasCanComplete && !hasIssues && !hasBlockerCount) {
        return null;
    }

    return buildStageCompletionReadinessSnapshot(record);
}

export function readStageCompletionReadinessChangedWorkAreaId(payload: unknown): string | undefined {
    const record = parseReadinessRecord(payload);
    if (!record) {
        return undefined;
    }

    return parseMaybeString(record.work_area_id ?? record.workAreaId);
}
