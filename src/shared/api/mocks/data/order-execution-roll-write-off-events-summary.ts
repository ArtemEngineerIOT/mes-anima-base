const MOCK_SUMMARY_BY_WORK_AREA: Record<
    string,
    { unprocessedCount: number; processedCount: number }
> = {
    "191": { unprocessedCount: 1, processedCount: 0 },
    "195": { unprocessedCount: 1, processedCount: 1 },
    "207": { unprocessedCount: 1, processedCount: 0 },
    "504": { unprocessedCount: 1, processedCount: 1 },
};

function buildErrorResponse(message: string) {
    return [{ error_code: "INVALID_INPUT", error_message: message, result: [] }];
}

export function buildMockRollWriteOffEventsSummaryResponse(workAreaId: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    const summary = MOCK_SUMMARY_BY_WORK_AREA[normalized] ?? {
        unprocessedCount: 0,
        processedCount: 0,
    };
    const totalCount = summary.unprocessedCount + summary.processedCount;

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: normalized,
                    unprocessed_count: summary.unprocessedCount,
                    processed_count: summary.processedCount,
                    total_count: totalCount,
                    // Как release_block.changed_at у «Выпуск»
                    changed_at: "05.08.2026 12:46:53",
                    last_event_at: totalCount > 0 ? "05.08.2026 12:46:53" : "",
                    last_event_name: totalCount > 0 ? "rawRelease" : "",
                    last_event_description: totalCount > 0 ? "Сырьевой выпуск" : "",
                    last_event_length_m: totalCount > 0 ? "85.0" : "",
                },
            ],
            result_field_labels: [
                { name: "unprocessed_count", label: "Необработанные сигналы" },
                { name: "processed_count", label: "Обработанные сигналы" },
            ],
        },
    ];
}
