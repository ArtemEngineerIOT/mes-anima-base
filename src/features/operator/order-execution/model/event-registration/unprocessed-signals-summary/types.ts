export type UnprocessedSignalsSummaryField = {
    key: string;
    label: string;
    value: number;
};

export type UnprocessedSignalsSummarySnapshot = {
    unprocessedCount: number;
    processedCount: number;
    totalCount: number;
    /** Время обновления сводки (`changed_at` из machine_signals_block / STOMP) */
    changedAt: string | null;
    fields: UnprocessedSignalsSummaryField[];
};

export const UNPROCESSED_SIGNALS_SUMMARY_DEFAULT_FIELDS: ReadonlyArray<{
    key: string;
    label: string;
}> = [
    { key: "unprocessed_count", label: "Сигналов необработано" },
    { key: "processed_count", label: "Сигналов обработано" },
] as const;

export const UNPROCESSED_SIGNALS_SUMMARY_EMPTY: UnprocessedSignalsSummarySnapshot = {
    unprocessedCount: 0,
    processedCount: 0,
    totalCount: 0,
    changedAt: null,
    fields: UNPROCESSED_SIGNALS_SUMMARY_DEFAULT_FIELDS.map((field) => ({
        ...field,
        value: 0,
    })),
};
