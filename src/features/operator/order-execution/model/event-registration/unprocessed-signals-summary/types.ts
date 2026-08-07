export type UnprocessedSignalsSummaryRow = {
    signalName: string;
    signalDescription: string;
    count: number;
};

export type UnprocessedSignalsSummarySnapshot = {
    totalCount: number;
    lastEventAt: string;
    /** Время обновления сводки (`changed_at` из machine_signals_block / STOMP) */
    changedAt: string | null;
    summaryRows: UnprocessedSignalsSummaryRow[];
};

export const UNPROCESSED_SIGNALS_SUMMARY_EMPTY: UnprocessedSignalsSummarySnapshot = {
    totalCount: 0,
    lastEventAt: "",
    changedAt: null,
    summaryRows: [],
};
