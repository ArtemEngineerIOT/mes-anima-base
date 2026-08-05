type MockStageProgress = {
    plan_min_m: number;
    plan_max_m: number;
    released_good_meterage_m: number;
    remaining_meterage_m: number;
    progress_percent: number;
};

const MOCK_PROGRESS_BY_WORK_AREA: Record<string, MockStageProgress> = {
    "207": {
        plan_min_m: 1200,
        plan_max_m: 1300,
        released_good_meterage_m: 349,
        remaining_meterage_m: 901,
        progress_percent: 27.9,
    },
    "504": {
        plan_min_m: 1900,
        plan_max_m: 2100,
        released_good_meterage_m: 540,
        remaining_meterage_m: 1460,
        progress_percent: 27,
    },
};

const DEFAULT_PROGRESS: MockStageProgress = {
    plan_min_m: 950,
    plan_max_m: 1050,
    released_good_meterage_m: 250,
    remaining_meterage_m: 750,
    progress_percent: 25,
};

function buildErrorResponse(message: string) {
    return [{ error_code: "INVALID_INPUT", error_message: message, result: [] }];
}

export function buildMockArmExecutionStageProgressResponse(workAreaId: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    const progress = MOCK_PROGRESS_BY_WORK_AREA[normalized] ?? DEFAULT_PROGRESS;

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: normalized,
                    ...progress,
                },
            ],
        },
    ];
}
