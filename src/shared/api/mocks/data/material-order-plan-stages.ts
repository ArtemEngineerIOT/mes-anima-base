import type { MockProductionPlanStageRow } from "./production-plan";
import { MOCK_PRODUCTION_PLAN_STAGES } from "./production-plan";

export function buildMockMaterialOrderPlanStagesResponse(resourceCode: string) {
    const normalizedResourceCode = resourceCode.trim().toUpperCase();

    if (!normalizedResourceCode) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите resourceCode",
                resource_id: "",
                result: [],
            },
        ];
    }

    const result = MOCK_PRODUCTION_PLAN_STAGES.filter(
        (row) => row.resource_id.toUpperCase() === normalizedResourceCode,
    );

    return [
        {
            error_code: "OK",
            error_message: "",
            resource_id: resourceCode.trim(),
            result,
        },
    ];
}

export type { MockProductionPlanStageRow as MockMaterialOrderPlanStageRow };
