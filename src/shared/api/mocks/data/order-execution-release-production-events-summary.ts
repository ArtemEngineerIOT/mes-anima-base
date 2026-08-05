const MOCK_SUMMARY_BY_WORK_AREA: Record<string, { unprocessed_count: number; processed_count: number }> = {
    "207": { unprocessed_count: 2, processed_count: 15 },
    "504": { unprocessed_count: 1, processed_count: 8 },
    "11": { unprocessed_count: 301, processed_count: 45 },
};

const MOCK_RESULT_FIELD_LABELS = [
    { name: "unprocessed_count", label: "Сигналов необработано" },
    { name: "processed_count", label: "Сигналов обработано" },
] as const;

function buildErrorResponse(message: string) {
    return [{ error_code: "INVALID_INPUT", error_message: message, result: [] }];
}

export function buildMockReleaseProductionEventsSummaryResponse(workAreaId: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    const summary = MOCK_SUMMARY_BY_WORK_AREA[normalized] ?? { unprocessed_count: 0, processed_count: 0 };

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: normalized,
                    unprocessed_count: summary.unprocessed_count,
                    processed_count: summary.processed_count,
                },
            ],
            result_field_labels: [...MOCK_RESULT_FIELD_LABELS],
        },
    ];
}
