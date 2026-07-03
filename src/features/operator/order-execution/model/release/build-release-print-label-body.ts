import type { ApiSchemas } from "@/shared/api/schema";

export function buildReleasePrintLabelBody(input: {
    workAreaId: string;
    materialProductionReleaseId: string;
}): ApiSchemas["OrderExecutionPrepareReleaseLabelRequest"] {
    return [
        {
            workAreaId: input.workAreaId,
            materialProductionReleaseId: input.materialProductionReleaseId,
        },
    ];
}
