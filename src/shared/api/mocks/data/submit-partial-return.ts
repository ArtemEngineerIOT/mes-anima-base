export function buildMockSubmitPartialReturnResponse(
    workAreaId: string,
    materialRollId: string,
    barcode: string,
    length: number,
    weight: number,
    warehouse: string,
    operatorRef: string,
) {
    if (
        !workAreaId.trim() ||
        !materialRollId.trim() ||
        !barcode.trim() ||
        !warehouse.trim() ||
        !operatorRef.trim()
    ) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите workAreaId, materialRollId, barcode, warehouse и operatorRef",
                result: [],
            },
        ];
    }

    if (!Number.isFinite(length) || length <= 0 || !Number.isFinite(weight) || weight <= 0) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите корректные length и weight",
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
                    presence_refresh_hint: true,
                    stage_registry_refresh_hint: true,
                },
            ],
        },
    ];
}
