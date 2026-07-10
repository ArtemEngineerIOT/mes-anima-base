export function buildMockListReturnWarehousesResponse(workAreaId: string, operatorRef: string) {
    const normalizedWorkAreaId = workAreaId.trim();
    const normalizedOperatorRef = operatorRef.trim();

    if (!normalizedWorkAreaId) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите workAreaId",
                result: [],
            },
        ];
    }

    if (!normalizedOperatorRef) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите operatorRef",
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
                    warehouse_code: "100",
                    warehouse_label: "Склад 100",
                },
                {
                    warehouse_code: "200",
                    warehouse_label: "Склад 200",
                },
            ],
        },
    ];
}
