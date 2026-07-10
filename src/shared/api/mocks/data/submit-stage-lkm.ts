export function buildMockSubmitStageLkmResponse(workAreaId: string, operatorRef: string) {
    if (!workAreaId.trim() || !operatorRef.trim()) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите workAreaId и operatorRef",
                result: [],
            },
        ];
    }

    return [
        {
            error_message: "",
            error_code: "OK",
            result: [{}],
        },
    ];
}
