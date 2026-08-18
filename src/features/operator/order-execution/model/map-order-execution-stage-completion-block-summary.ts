import { buildStageCompletionReadinessSnapshot } from "./stage-completion-readiness/build-stage-completion-readiness-snapshot";
import type { StageCompletionReadinessSnapshot } from "./stage-completion-readiness/types";

function readWorkAreaId(value: unknown): string | null {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed ? trimmed : null;
    }
    return null;
}

export function mapOrderExecutionStageCompletionBlockSummary(
    record: Record<string, unknown>,
    workAreaId: string | null,
): StageCompletionReadinessSnapshot | null {
    const blockRaw = record.stage_completion_block ?? record.stageCompletionBlock;
    if (!Array.isArray(blockRaw) || blockRaw.length === 0) {
        return null;
    }

    const blockItem =
        blockRaw.find((item) => {
            if (!item || typeof item !== "object") {
                return false;
            }

            const itemWorkAreaId = readWorkAreaId((item as Record<string, unknown>).work_area_id);
            return workAreaId !== null && itemWorkAreaId === workAreaId;
        }) ?? blockRaw[0];

    if (!blockItem || typeof blockItem !== "object") {
        return null;
    }

    const blockRecord = blockItem as Record<string, unknown>;
    const blockWorkAreaId = readWorkAreaId(blockRecord.work_area_id ?? blockRecord.workAreaId);

    if (workAreaId !== null && blockWorkAreaId !== null && blockWorkAreaId !== workAreaId) {
        return null;
    }

    return buildStageCompletionReadinessSnapshot(blockRecord);
}
