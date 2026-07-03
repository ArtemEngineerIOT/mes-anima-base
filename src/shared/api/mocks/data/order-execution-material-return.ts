export function buildMockRegisterOrderExecutionMaterialReturnResponse(
    workAreaId: string,
    barcode: string,
    length: number,
    weight: number,
    warehouse: string,
) {
    if (!workAreaId.trim() || !barcode.trim() || !warehouse.trim()) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите workAreaId, barcode и warehouse",
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
                    stage_registry_refresh_hint: true,
                },
            ],
        },
    ];
}
