const MOCK_SUMMARY_BY_WORK_AREA: Record<
    string,
    {
        unprocessed_count: number;
        processed_count: number;
        total_count: number;
        changed_at: string;
    }
> = {
    "191": {
        unprocessed_count: 2,
        processed_count: 146,
        total_count: 148,
        changed_at: "07.08.2026 12:56:16",
    },
    "207": {
        unprocessed_count: 3,
        processed_count: 12,
        total_count: 15,
        changed_at: "16.07.2026 22:11:35",
    },
    "504": {
        unprocessed_count: 1,
        processed_count: 4,
        total_count: 5,
        changed_at: "16.07.2026 18:40:12",
    },
};

const DEFAULT_SUMMARY = {
    unprocessed_count: 0,
    processed_count: 0,
    total_count: 0,
    changed_at: "",
};

const MOCK_RESULT_FIELD_LABELS = [
    { name: "unprocessed_count", label: "Сигналов необработано" },
    { name: "processed_count", label: "Сигналов обработано" },
] as const;

function buildErrorResponse(message: string) {
    return [{ error_code: "INVALID_INPUT", error_message: message, result: [] }];
}

export function buildMockUnprocessedSignalsSummaryResponse(workAreaId: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    const data = MOCK_SUMMARY_BY_WORK_AREA[normalized] ?? DEFAULT_SUMMARY;

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: normalized,
                    ...data,
                },
            ],
            result_field_labels: [...MOCK_RESULT_FIELD_LABELS],
        },
    ];
}
