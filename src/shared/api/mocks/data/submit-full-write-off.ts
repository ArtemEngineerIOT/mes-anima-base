export function buildMockSubmitFullWriteOffResponse(
    workAreaId: string,
    materialRollId: string,
    barcode: string,
    operatorRef: string,
) {
    if (!workAreaId.trim() || !materialRollId.trim() || !barcode.trim() || !operatorRef.trim()) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите workAreaId, materialRollId, barcode и operatorRef",
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
