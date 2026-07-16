import type { ApiSchemas } from "@/shared/api/schema";

export function buildMockOrderStageCompletionSubmitResponse(params: {
    workAreaId: string;
    completedBy: string;
}): ApiSchemas["OrderExecutionStageCompletionSubmitResponse"] {
    if (!params.completedBy.trim()) {
        return [
            {
                error_code: "INVALID_INPUT",
                error_message: "Укажите completedBy",
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
                    work_area_id: params.workAreaId,
                    status_code: "COMPLETED",
                    warnings: [],
                    paused_sibling_modal: [],
                    blocking_issues: [],
                },
            ],
        },
    ];
}
