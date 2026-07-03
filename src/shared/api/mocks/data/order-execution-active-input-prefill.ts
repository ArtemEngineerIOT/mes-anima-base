/** Демо ACTIVE вход WA 207 — пробелы в `series_key` значимы (SCR-04). */
export const MOCK_WA207_ACTIVE_INPUT_SERIES_KEY = "002672230  1";

export const MOCK_WA207_ACTIVE_INPUT_ROLL = {
    nomenclature_name: "290A01-0010-0018",
    current_length_m: 580.0,
    nomenclature_code: "290A01-0010-0018",
    material_roll_id: "51",
    series_key: MOCK_WA207_ACTIVE_INPUT_SERIES_KEY,
    roll_trace_context_id: "139",
} as const;

export function buildMockActiveInputPrefillResponse(workAreaId: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return [{ error_code: "INVALID_INPUT", error_message: "Укажите workAreaId", result: [] }];
    }

    if (normalized === "207") {
        return [
            {
                error_message: "",
                result: [
                    {
                        work_area_id: normalized,
                        has_active_input_roll: true,
                        should_prefill_scan: true,
                        active_input_rolls: [MOCK_WA207_ACTIVE_INPUT_ROLL],
                    },
                ],
                error_code: "OK",
            },
        ];
    }

    return [
        {
            error_message: "",
            result: [
                {
                    work_area_id: normalized,
                    has_active_input_roll: false,
                    should_prefill_scan: false,
                    active_input_rolls: [],
                },
            ],
            error_code: "OK",
        },
    ];
}
