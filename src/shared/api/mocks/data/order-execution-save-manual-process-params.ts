import type { ApiSchemas } from "@/shared/api/schema";

export function buildMockSaveManualProcessParamsResponse(
    workAreaId: string,
): ApiSchemas["OrderExecutionSaveManualProcessParamsResponse"] {
    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: workAreaId,
                    status: "SAVED",
                },
            ],
        },
    ];
}
