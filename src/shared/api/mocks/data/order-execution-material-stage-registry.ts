export function buildMockOrderExecutionMaterialStageRegistryResponse(workAreaId: string) {
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
            work_area_id: normalized,
            as_of: "Wed Jun 24 13:02:31 MSK 2026",
            result: [
                {
                    nomenclature_name: "UI3-LOT-209-A",
                    roll_status_label: "IN_WORK",
                    uom_secondary: "MTR",
                    quantity_primary: 33.0,
                    material_roll_id: "29",
                    uom_primary: "KGM",
                    stage_input_card_status: "ACTIVE",
                    barcode: "UI3-LOT-209-A",
                    quantity_secondary: 100.0,
                    roll_status: "IN_WORK",
                    operation_lines: [],
                },
                {
                    nomenclature_name: "test",
                    roll_status_label: "WRITTEN_OFF",
                    uom_secondary: "MTR",
                    quantity_primary: 0.0,
                    material_roll_id: "30",
                    uom_primary: "KGM",
                    stage_input_card_status: "ACTIVE",
                    barcode: "test",
                    quantity_secondary: 0.0,
                    roll_status: "WRITTEN_OFF",
                    operation_lines: [
                        {
                            uom_secondary: "MTR",
                            operation_kind_label: "Списание",
                            quantity_primary: 33.0,
                            uom_primary: "KGM",
                            quantity_secondary: 100.0,
                            operation_kind: "CONSUMPTION",
                        },
                    ],
                },
                {
                    nomenclature_name: "max",
                    roll_status_label: "WRITTEN_OFF",
                    uom_secondary: "MTR",
                    quantity_primary: 0.0,
                    material_roll_id: "35",
                    uom_primary: "KGM",
                    stage_input_card_status: "CLOSED",
                    barcode: "max",
                    quantity_secondary: 0.0,
                    roll_status: "WRITTEN_OFF",
                    operation_lines: [
                        {
                            uom_secondary: "MTR",
                            operation_kind_label: "Списание",
                            quantity_primary: 9.0,
                            uom_primary: "KGM",
                            quantity_secondary: 20.0,
                            operation_kind: "CONSUMPTION",
                        },
                        {
                            uom_secondary: "MTR",
                            operation_kind_label: "Возврат",
                            quantity_primary: 17.4,
                            uom_primary: "KGM",
                            quantity_secondary: 60.0,
                            operation_kind: "RETURN",
                        },
                    ],
                },
                {
                    nomenclature_name: "WA207-REL-001",
                    roll_status_label: "IN_WORK",
                    uom_secondary: "MTR",
                    quantity_primary: 3.75,
                    material_roll_id: "41",
                    uom_primary: "KGM",
                    stage_input_card_status: "ACTIVE",
                    barcode: "WA207-REL-001",
                    quantity_secondary: 95.5,
                    roll_status: "IN_WORK",
                    operation_lines: [
                        {
                            uom_secondary: "MTR",
                            operation_kind_label: "Списание",
                            quantity_primary: 5.0,
                            uom_primary: "KGM",
                            quantity_secondary: 10.0,
                            operation_kind: "CONSUMPTION",
                        },
                        {
                            uom_secondary: "MTR",
                            operation_kind_label: "Возврат",
                            quantity_primary: 3.75,
                            uom_primary: "KGM",
                            quantity_secondary: 95.5,
                            operation_kind: "RETURN",
                        },
                    ],
                },
            ],
        },
    ];
}
