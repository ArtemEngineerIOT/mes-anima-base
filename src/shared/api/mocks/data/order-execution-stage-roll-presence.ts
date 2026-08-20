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
                    as_of: "18.08.2026 14:57:01",
                    slot_groups: [
                        {
                            unwind_label: "Размотка 1",
                            delivery_kind: "SEMI_FINISHED",
                            nomenclature_name: "49502792 FELIX GiJ Salmon 75g RU12 25_1144 110-P",
                            waiting_rows: [],
                            nomenclature_code: "110-P-10589-0054",
                            unwind_no: "1",
                            unwind_row: [],
                        },
                        {
                            unwind_label: "Размотка 2",
                            delivery_kind: "RAW_MATERIAL",
                            nomenclature_name: "GR PE/LP 60 mc 1.08.04.0 1146",
                            waiting_rows: [
                                {
                                    presence_status: "WAITING",
                                    current_length_m: 10400.0,
                                    presence_id: "83",
                                    current_weight_kg: 613.0,
                                    can_move_to_unwind: false,
                                    material_roll_id: "236",
                                    presence_status_label: "WAITING",
                                    barcode: "00410930   29",
                                    write_off_allowed: false,
                                },
                            ],
                            nomenclature_code: "210VE03-06001146",
                            unwind_no: "2",
                            unwind_row: [
                                {
                                    presence_status: "ON_UNWIND",
                                    current_length_m: 10400.0,
                                    presence_id: "82",
                                    current_weight_kg: 613.0,
                                    can_move_to_unwind: false,
                                    material_roll_id: "235",
                                    presence_status_label: "ON_UNWIND",
                                    barcode: "00410930   28",
                                    write_off_allowed: true,
                                },
                            ],
                        },
                        {
                            unwind_label: "Размотка 3",
                            delivery_kind: "RAW_MATERIAL",
                            nomenclature_name: "ALU 8079 6,35 mc 1140 mm",
                            waiting_rows: [],
                            nomenclature_code: "240AL01-6.351140",
                            unwind_no: "3",
                            unwind_row: [
                                {
                                    presence_status: "ON_UNWIND",
                                    current_length_m: 930000.0,
                                    presence_id: "84",
                                    current_weight_kg: 930.0,
                                    can_move_to_unwind: false,
                                    material_roll_id: "237",
                                    presence_status_label: "ON_UNWIND",
                                    barcode: "002066110   3",
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
