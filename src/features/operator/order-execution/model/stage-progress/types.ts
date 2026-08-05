export type StageProgress = {
    planMinM: number | null;
    planMaxM: number | null;
    releasedGoodMeterageM: number | null;
    remainingMeterageM: number | null;
    progressPercent: number | null;
};

export type StageProgressInfoItem = {
    key: string;
    value: string;
};

export const STAGE_PROGRESS_EMPTY: StageProgress = {
    planMinM: null,
    planMaxM: null,
    releasedGoodMeterageM: null,
    remainingMeterageM: null,
    progressPercent: null,
};
