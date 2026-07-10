export function buildMockSubmitMoveToUnwindResponse(materialRollId: string, barcode: string) {
    const trimmedMaterialRollId = materialRollId.trim();
    const trimmedBarcode = barcode.trim();

    if (!trimmedMaterialRollId) {
        return [
            {
                error_code: "INVALID_INPUT",
                error_message: "Укажите materialRollId",
                result: [],
            },
        ];
    }

    if (!trimmedBarcode) {
        return [
            {
                error_code: "INVALID_INPUT",
                error_message: "Укажите barcode",
                result: [],
            },
        ];
    }

    if (trimmedMaterialRollId === "occupied") {
        return [
            {
                error_code: "SLOT_UNWIND_OCCUPIED",
                error_message: "На размотке уже есть рулон этой номенклатуры",
                result: [],
            },
        ];
    }

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    material_roll_id: trimmedMaterialRollId,
                    presence_status: "ON_UNWIND",
                    presence_refresh_hint: true,
                    stage_registry_refresh_hint: true,
                },
            ],
        },
    ];
}
