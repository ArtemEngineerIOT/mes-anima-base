import { pickString } from "./release/map-release-rpc-utils";
import type { StageBlockingIssue } from "./stage-completion-types";

export function mapStageBlockingIssue(row: Record<string, unknown>): StageBlockingIssue | null {
    const message = pickString(row.message);
    if (!message) {
        return null;
    }

    return {
        code: pickString(row.code) ?? "",
        message,
    };
}

export function mapStageBlockingIssues(value: unknown): StageBlockingIssue[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map(mapStageBlockingIssue)
        .filter((item): item is StageBlockingIssue => item !== null);
}
