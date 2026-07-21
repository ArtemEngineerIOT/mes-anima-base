type MockSummaryRow = {
    signal_name: string;
    signal_description: string;
    count: number;
};

const MOCK_SUMMARY_BY_WORK_AREA: Record<string, { total_count: number; last_event_at: string; summary: MockSummaryRow[] }> =
    {
        "207": {
            total_count: 3,
            last_event_at: "2026-07-16 22:11:35",
            summary: [
                {
                    signal_name: "machine_stop",
                    signal_description: "Остановка машины",
                    count: 2,
                },
                {
                    signal_name: "knife_strike",
                    signal_description: "Удар ножа",
                    count: 1,
                },
            ],
        },
        "504": {
            total_count: 1,
            last_event_at: "2026-07-16 18:40:12",
            summary: [
                {
                    signal_name: "machine_stop",
                    signal_description: "Остановка машины",
                    count: 1,
                },
            ],
        },
    };

const DEFAULT_SUMMARY = {
    total_count: 0,
    last_event_at: "",
    summary: [] as MockSummaryRow[],
};

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
        },
    ];
}
