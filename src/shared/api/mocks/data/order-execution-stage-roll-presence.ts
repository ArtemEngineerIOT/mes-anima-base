export function buildMockOrderExecutionStageRollPresenceResponse(workAreaId: string) {
    const normalized = workAreaId.trim();

    if (!normalized) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите workAreaId",
                result: [],
            },
        ];
    }

    return [
        {
            error_message: "",
            error_code: "OK",
            result: [
                {
                    work_area_id: normalized,
                    as_of: "Thu Jul 09 23:22:24 MSK 2026",
                    slot_groups: [
                        {
                            nomenclature_name: "220UF05-01201138",
                            nomenclature_code: "220UF05-01201138",
                            waiting_rows: [
                                {
                                    presence_status: "WAITING",
                                    current_length_m: 346.37,
                                    presence_id: "194",
                                    current_weight_kg: 346.37,
                                    can_move_to_unwind: true,
                                    material_roll_id: "189",
                                    presence_status_label: "WAITING",
                                    barcode: "00130420   4",
                                    write_off_allowed: false,
                                },
                            ],
                            unwind_row: [
                                {
                                    presence_status: "ON_UNWIND",
                                    current_length_m: 100,
                                    presence_id: "195",
                                    current_weight_kg: 33,
                                    can_move_to_unwind: false,
                                    material_roll_id: "29",
                                    presence_status_label: "ON_UNWIND",
                                    barcode: "UI3-LOT-209-A",
                                    write_off_allowed: true,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];
}
