export function buildMockOrderExecutionMaterialWriteoffWeightResponse(length: number, workAreaId: string) {
    const normalizedWorkAreaId = workAreaId.trim();

    if (!normalizedWorkAreaId) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите workAreaId",
                result: [],
            },
        ];
    }

    if (!Number.isFinite(length) || length <= 0) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите корректный метраж",
                result: [],
            },
        ];
    }

    if (length === 999) {
        return [
            {
                error_code: "GRAMMATURA_NOT_FOUND",
                error_message: "Грамматура не найдена, применяется коэффициент 1.",
                result: [
                    {
                        weight_kg: Number((length * 1).toFixed(2)),
                        grammatura_kg_per_m: 1.0,
                        grammatura_source: "FALLBACK_UNIT",
                    },
                ],
            },
        ];
    }

    const weightKg = Number((length * 0.22).toFixed(2));

    return [
        {
            error_message: "",
            error_code: "OK",
            result: [
                {
                    weight_kg: weightKg,
                },
            ],
        },
    ];
}
