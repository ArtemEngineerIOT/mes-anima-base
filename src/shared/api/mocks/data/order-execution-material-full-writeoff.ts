export function buildMockRegisterOrderExecutionMaterialFullWriteoffResponse(
    workAreaId: string,
    barcode: string,
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
