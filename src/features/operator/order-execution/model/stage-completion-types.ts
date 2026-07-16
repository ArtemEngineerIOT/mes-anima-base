export type StageIncomingRollRow = {
    id: string;
    material: string;
    nomenclature: string;
    series: string;
    quantity: number;
    unit: string;
    machine: string;
    status: string;
    fr: string;
    blocked: boolean;
};

export type StageReleasedSeriesRow = {
    id: string;
    article: string;
    nomenclature: string;
    rewind: boolean;
    series: string;
    netWeight: number;
    grossWeight: number;
    unit: string;
    quantity: number;
    fr: string;
    blocked: boolean;
};

export type StageEventDetailRow = {
    parameter: string;
    value: string;
};

export type StageEventJournalRow = {
    id: string;
    eventCode: string;
    start: string;
    end: string;
    meterage: number;
    details?: StageEventDetailRow[];
};

export type StagePendingEventRow = {
    id: string;
    signal: string;
    start: string;
    end: string;
};

export type StageBlockingIssue = {
    code: string;
    message: string;
};

export type StageCompletionSnapshot = {
    workAreaId: string;
    incomingRolls: StageIncomingRollRow[];
    releasedSeries: StageReleasedSeriesRow[];
    eventJournal: StageEventJournalRow[];
    pendingEvents: StagePendingEventRow[];
    totalEventMeterage: number;
    defectPercent: number;
    canComplete: boolean;
    blockingIssues: StageBlockingIssue[];
    /** UC-16 A3: на машине есть приостановленный этап (после submit / warnings) */
    hasSuspendedStageOnMachine: boolean;
    suspendedStageLabel?: string;
};

export const EMPTY_STAGE_COMPLETION_SNAPSHOT: StageCompletionSnapshot = {
    workAreaId: "",
    incomingRolls: [],
    releasedSeries: [],
    eventJournal: [],
    pendingEvents: [],
    totalEventMeterage: 0,
    defectPercent: 0,
    canComplete: false,
    blockingIssues: [],
    hasSuspendedStageOnMachine: false,
    suspendedStageLabel: undefined,
};
