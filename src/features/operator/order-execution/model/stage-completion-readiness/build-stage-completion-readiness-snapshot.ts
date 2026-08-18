import { pickBoolean, pickNullableNumber, pickString } from "../release/map-release-rpc-utils";
import { mapStageBlockingIssues } from "../map-stage-blocking-issue";
import { STAGE_COMPLETION_READINESS_EMPTY, type StageCompletionReadinessSnapshot } from "./types";

/** Снимок из `stage_completion_block` / STOMP `stageCompletionReadinessChanged`. */
export function buildStageCompletionReadinessSnapshot(
    record: Record<string, unknown>,
): StageCompletionReadinessSnapshot {
    const blockingIssues = mapStageBlockingIssues(record.blocking_issues ?? record.blockingIssues);
    const blockerCount = pickNullableNumber(record.blocker_count ?? record.blockerCount);

    return {
        workAreaId: pickString(record.work_area_id ?? record.workAreaId) ?? null,
        canComplete: pickBoolean(record.can_complete ?? record.canComplete),
        blockerCount: blockerCount ?? blockingIssues.length,
        blockingIssues,
        changedAt: pickString(record.changed_at ?? record.changedAt) ?? null,
    };
}

export { STAGE_COMPLETION_READINESS_EMPTY };
