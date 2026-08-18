function buildErrorResponse(message: string) {
    return [{ error_code: "INVALID_INPUT", error_message: message, result: [] }];
}

export function buildMockLastProcessParamsSlicesResponse(workAreaId: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    slices: [
                        {
                            column_label: "Старт",
                            updated_at: "14.08.2026 15:00:57",
                            slice_kind: "START",
                            machine_params: [
                                { param_code: "print_speed", value: "0" },
                                { param_code: "unwinding1_reelstrain", value: "7" },
                                { param_code: "unwinding1_group", value: "2" },
                                { param_code: "unwinding1_coronator", value: "false" },
                                { param_code: "winding_reelstrain", value: "94" },
                                { param_code: "winding_group", value: "0" },
                                { param_code: "winding_difference", value: "70" },
                                { param_code: "winding_group_pressure", value: "" },
                                { param_code: "winding_reelshaft_pressure", value: "" },
                            ],
                            external_series_key: "Старт",
                            print_slots: [
                                { slot_no: 1, value: "19" },
                                { slot_no: 2, value: "18" },
                                { slot_no: 3, value: "19" },
                                { slot_no: 4, value: "20" },
                                { slot_no: 5, value: "19" },
                                { slot_no: 6, value: "19" },
                                { slot_no: 7, value: "19" },
                                { slot_no: 8, value: "19" },
                                { slot_no: 9, value: "21" },
                                { slot_no: 10, value: "18" },
                            ],
                            slice_no: 1,
                            captured_at: "14.08.2026 15:00:57",
                            material_roll_id: "stage-start",
                            source: "machine",
                        },
                    ],
                    machine_params: [
                        { param_code: "print_speed", standard_value: "350", tolerance: "" },
                        { param_code: "unwinding1_reelstrain", standard_value: "12.0", tolerance: "1.0" },
                        { param_code: "unwinding1_group", standard_value: "16.0", tolerance: "1.0" },
                        { param_code: "unwinding1_coronator", standard_value: "", tolerance: "" },
                        { param_code: "winding_reelstrain", standard_value: "10.0", tolerance: "1.0" },
                        { param_code: "winding_group", standard_value: "10.0", tolerance: "1.0" },
                        { param_code: "winding_difference", standard_value: "1.0", tolerance: "" },
                        { param_code: "winding_group_pressure", standard_value: "3.0", tolerance: "0.0" },
                        { param_code: "winding_reelshaft_pressure", standard_value: "3.0", tolerance: "0.0" },
                    ],
                    print_slots: [
                        {
                            presser_no: "",
                            setpoint: "",
                            color: "",
                            slot_role: "EMPTY",
                            slot_no: 1,
                            is_empty: "true",
                            tolerance: "5.0",
                        },
                        {
                            presser_no: "1",
                            setpoint: "75",
                            color: "BLACK",
                            slot_role: "PRINT",
                            slot_no: 2,
                            is_empty: "false",
                            tolerance: "5.0",
                        },
                        {
                            presser_no: "2",
                            setpoint: "75",
                            color: "CYAN",
                            slot_role: "PRINT",
                            slot_no: 3,
                            is_empty: "false",
                            tolerance: "5.0",
                        },
                        {
                            presser_no: "3",
                            setpoint: "75",
                            color: "MAGENTA",
                            slot_role: "PRINT",
                            slot_no: 4,
                            is_empty: "false",
                            tolerance: "5.0",
                        },
                        {
                            presser_no: "4",
                            setpoint: "75",
                            color: "YELLOW",
                            slot_role: "PRINT",
                            slot_no: 5,
                            is_empty: "false",
                            tolerance: "5.0",
                        },
                        {
                            presser_no: "5",
                            setpoint: "75",
                            color: "RED",
                            slot_role: "PRINT",
                            slot_no: 6,
                            is_empty: "false",
                            tolerance: "5.0",
                        },
                        {
                            presser_no: "6",
                            setpoint: "75",
                            color: "GREEN",
                            slot_role: "PRINT",
                            slot_no: 7,
                            is_empty: "false",
                            tolerance: "5.0",
                        },
                        {
                            presser_no: "7",
                            setpoint: "105",
                            color: "WHITE",
                            slot_role: "PRINT",
                            slot_no: 8,
                            is_empty: "false",
                            tolerance: "5.0",
                        },
                        {
                            presser_no: "8",
                            setpoint: "100-100",
                            color: "HEATING",
                            slot_role: "HEATING",
                            slot_no: 9,
                            is_empty: "false",
                            tolerance: "5.0",
                        },
                        {
                            presser_no: "",
                            setpoint: "",
                            color: "",
                            slot_role: "EMPTY",
                            slot_no: 10,
                            is_empty: "true",
                            tolerance: "",
                        },
                    ],
                },
            ],
        },
    ];
}
