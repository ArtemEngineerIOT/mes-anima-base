export type UnprocessedSignalsSummaryRow = {
    signalName: string;
    signalDescription: string;
    count: number;
};

export type UnprocessedSignalsSummarySnapshot = {
    totalCount: number;
    lastEventAt: string;
    summaryRows: UnprocessedSignalsSummaryRow[];
};

export const UNPROCESSED_SIGNALS_SUMMARY_EMPTY: UnprocessedSignalsSummarySnapshot = {
    totalCount: 0,
    lastEventAt: "",
    summaryRows: [],
};
