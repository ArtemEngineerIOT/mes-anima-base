const MOCK_TOTAL_COUNT_BY_WORK_AREA: Record<string, number> = {
    "207": 2,
    "504": 1,
};

function buildErrorResponse(message: string) {
    return [{ error_code: "INVALID_INPUT", error_message: message, result: [] }];
}

export function buildMockReleaseProductionEventsSummaryResponse(workAreaId: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    const totalCount = MOCK_TOTAL_COUNT_BY_WORK_AREA[normalized] ?? 0;

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: normalized,
                    total_count: totalCount,
                    last_event_at: totalCount > 0 ? "2026-07-16 22:11:35" : "",
                    last_event_name: totalCount > 0 ? "defectRelease" : "",
                    last_event_description: totalCount > 0 ? "Выпуск брака" : "",
                    last_event_length_m: totalCount > 0 ? "120.5" : "",
                },
            ],
        },
    ];
}
