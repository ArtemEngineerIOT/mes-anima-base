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
 * STOMP `processParamsSliceCreated` — JSON-массив с одним элементом:
 * `[{ work_area_id, ... }]`.
 */
function parseSliceCreatedRecord(payload: unknown): Record<string, unknown> | null {
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

export function readProcessParamsSliceCreatedWorkAreaId(payload: unknown): string | undefined {
    const record = parseSliceCreatedRecord(payload);
    if (!record) {
        return undefined;
    }

    return parseMaybeString(record.work_area_id ?? record.workAreaId);
}
