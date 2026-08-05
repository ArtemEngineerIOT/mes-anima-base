export type ReleaseProductionEventsSummaryField = {
    key: string;
    label: string;
    value: number;
};

export type ReleaseProductionEventsSummarySnapshot = {
    unprocessedCount: number;
    processedCount: number;
    totalCount: number;
    changedAt: string | null;
    fields: ReleaseProductionEventsSummaryField[];
};

export const RELEASE_PRODUCTION_EVENTS_SUMMARY_DEFAULT_FIELDS: ReadonlyArray<{
    key: string;
    label: string;
}> = [
    { key: "unprocessed_count", label: "Сигналов необработано" },
    { key: "processed_count", label: "Сигналов обработано" },
] as const;

export const RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY: ReleaseProductionEventsSummarySnapshot = {
    unprocessedCount: 0,
    processedCount: 0,
    totalCount: 0,
    changedAt: null,
    fields: RELEASE_PRODUCTION_EVENTS_SUMMARY_DEFAULT_FIELDS.map((field) => ({
        ...field,
        value: 0,
    })),
};
