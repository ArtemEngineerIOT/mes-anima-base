export type RollWriteOffEventsSummaryField = {
    key: string;
    label: string;
    value: number;
};

export type RollWriteOffEventsSummarySnapshot = {
    unprocessedCount: number;
    processedCount: number;
    totalCount: number;
    changedAt: string | null;
    fields: RollWriteOffEventsSummaryField[];
};

export const ROLL_WRITE_OFF_EVENTS_SUMMARY_DEFAULT_FIELDS: ReadonlyArray<{
    key: string;
    label: string;
}> = [
    { key: "unprocessed_count", label: "Необработанные сигналы" },
    { key: "processed_count", label: "Обработанные сигналы" },
] as const;

export const ROLL_WRITE_OFF_EVENTS_SUMMARY_EMPTY: RollWriteOffEventsSummarySnapshot = {
    unprocessedCount: 0,
    processedCount: 0,
    totalCount: 0,
    changedAt: null,
    fields: ROLL_WRITE_OFF_EVENTS_SUMMARY_DEFAULT_FIELDS.map((field) => ({
        ...field,
        value: 0,
    })),
};
