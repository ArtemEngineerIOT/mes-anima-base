const MOCK_TOTAL_COUNT_BY_WORK_AREA: Record<string, number> = {
    "207": 1,
    "504": 2,
};

function buildErrorResponse(message: string) {
    return [{ error_code: "INVALID_INPUT", error_message: message, result: [] }];
}

export function buildMockRollWriteOffEventsSummaryResponse(workAreaId: string) {
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
                    last_event_at: totalCount > 0 ? "2026-07-16 21:05:10" : "",
                    last_event_name: totalCount > 0 ? "rawRelease" : "",
                    last_event_description: totalCount > 0 ? "Сырьевой выпуск" : "",
                    last_event_length_m: totalCount > 0 ? "85.0" : "",
                },
            ],
        },
    ];
}
