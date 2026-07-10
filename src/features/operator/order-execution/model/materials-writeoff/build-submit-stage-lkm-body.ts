import type { ApiSchemas } from "@/shared/api/schema";

type BuildSubmitStageLkmBodyParams = {
    workAreaId: string;
    operatorRef: string;
};

export function buildSubmitStageLkmBody(
    params: BuildSubmitStageLkmBodyParams,
): ApiSchemas["SubmitStageLkmRequest"] {
    return [
        {
            workAreaId: params.workAreaId,
            operatorRef: params.operatorRef,
        },
    ];
}
