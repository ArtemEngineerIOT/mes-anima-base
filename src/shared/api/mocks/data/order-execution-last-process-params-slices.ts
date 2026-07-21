function buildErrorResponse(message: string) {
    return [{ error_code: "INVALID_INPUT", error_message: message, result: [] }];
}

type MockSliceParam = {
    param_code: string;
    value: string;
};

const MOCK_SLICES: Array<{
    slice_no: number;
    external_series_key: string;
    updated_at: string;
    params: MockSliceParam[];
}> = [
    {
        slice_no: 1,
        external_series_key: "506827 11",
        updated_at: "2026-07-17 15:25:18",
        params: [
            { param_code: "UNIT_1_HOOD_1_ACT_TEMP_", value: "47" },
            { param_code: "UNIT_1_HOOD_2_ACT_TEMP_", value: "23" },
            { param_code: "PRINTING_UNIT_INLET_ACT_TENSION_L_C_", value: "44" },
            { param_code: "UNW_ACT_TENSION_L_C_", value: "33" },
            { param_code: "REW_ACT_TENSION_CALCULATED", value: "94" },
            { param_code: "REW_INLET_ACT_TENSION_L_C_", value: "113" },
            { param_code: "MAIN_MOTOR_CALC_SPEED_MIS", value: "20" },
            { param_code: "UNW_CORONA_CONTACTOR", value: "false" },
        ],
    },
    {
        slice_no: 2,
        external_series_key: "SMOKE 1",
        updated_at: "2026-07-17 15:26:15",
        params: [
            { param_code: "MAIN_MOTOR_CALC_SPEED_MIS", value: "350" },
            { param_code: "col_ps1", value: "C1" },
            { param_code: "presser_ps1", value: "11" },
            { param_code: "start_ps1", value: "12:00" },
        ],
    },
    {
        slice_no: 3,
        external_series_key: "506827 12",
        updated_at: "2026-07-17 16:10:31",
        params: [
            { param_code: "UNIT_1_HOOD_1_ACT_TEMP_", value: "27" },
            { param_code: "UNIT_1_HOOD_2_ACT_TEMP_", value: "23" },
            { param_code: "PRINTING_UNIT_INLET_ACT_TENSION_L_C_", value: "162" },
            { param_code: "UNW_ACT_TENSION_L_C_", value: "124" },
            { param_code: "REW_ACT_TENSION_CALCULATED", value: "89" },
            { param_code: "REW_INLET_ACT_TENSION_L_C_", value: "110" },
            { param_code: "MAIN_MOTOR_CALC_SPEED_MIS", value: "350" },
            { param_code: "UNW_CORONA_CONTACTOR", value: "false" },
        ],
    },
];

export function buildMockLastProcessParamsSlicesResponse(workAreaId: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    const result = MOCK_SLICES.flatMap((slice) =>
        slice.params.map((param) => ({
            work_area_id: normalized,
            slice_no: slice.slice_no,
            external_series_key: slice.external_series_key,
            updated_at: slice.updated_at,
            captured_at: slice.updated_at,
            material_roll_id: `roll-${slice.slice_no}`,
            param_code: param.param_code,
            value: param.value,
            origin: slice.slice_no === 2 ? "OPERATOR" : "MACHINE",
            source: slice.slice_no === 2 ? "operator" : "machine",
        })),
    );

    return [
        {
            error_code: "OK",
            error_message: "",
            result,
        },
    ];
}
