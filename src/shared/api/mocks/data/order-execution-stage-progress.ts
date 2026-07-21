type MockStageProgress = {
    required_meterage_m: number;
    released_good_meterage_m: number;
    remaining_meterage_m: number;
    progress_percent: number;
};

const MOCK_PROGRESS_BY_WORK_AREA: Record<string, MockStageProgress> = {
    "207": {
        required_meterage_m: 1250,
        released_good_meterage_m: 349,
        remaining_meterage_m: 901,
        progress_percent: 27.9,
    },
    "504": {
        required_meterage_m: 2000,
        released_good_meterage_m: 540,
        remaining_meterage_m: 1460,
        progress_percent: 27,
    },
};

const DEFAULT_PROGRESS: MockStageProgress = {
    required_meterage_m: 1000,
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
