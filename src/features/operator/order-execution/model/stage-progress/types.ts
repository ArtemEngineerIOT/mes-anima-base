export type StageProgress = {
    requiredMeterageM: number | null;
    releasedGoodMeterageM: number | null;
    remainingMeterageM: number | null;
    progressPercent: number | null;
};

export type StageProgressInfoItem = {
    key: string;
    value: string;
};

export const STAGE_PROGRESS_EMPTY: StageProgress = {
    requiredMeterageM: null,
    releasedGoodMeterageM: null,
    remainingMeterageM: null,
    progressPercent: null,
};
