import type { StageBlockingIssue } from "../stage-completion-types";

export type StageCompletionReadinessSnapshot = {
    workAreaId: string | null;
    canComplete: boolean;
    /** Счётчик в шапке блока (`blocker_count`) */
    blockerCount: number;
    blockingIssues: StageBlockingIssue[];
    changedAt: string | null;
};

export const STAGE_COMPLETION_READINESS_EMPTY: StageCompletionReadinessSnapshot = {
    workAreaId: null,
    canComplete: false,
    blockerCount: 0,
    blockingIssues: [],
    changedAt: null,
};
