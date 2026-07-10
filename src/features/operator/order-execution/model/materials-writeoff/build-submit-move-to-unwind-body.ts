import type { ApiSchemas } from "@/shared/api/schema";

export type SubmitMoveToUnwindBodyParams = {
    workAreaId: string;
    materialRollId: string;
    barcode: string;
    operatorRef: string;
};

export function buildSubmitMoveToUnwindBody(
    params: SubmitMoveToUnwindBodyParams,
): ApiSchemas["OrderExecutionSubmitMoveToUnwindRequest"] {
    return [
        {
            workAreaId: params.workAreaId,
            materialRollId: params.materialRollId,
            barcode: params.barcode,
            operatorRef: params.operatorRef,
        },
    ];
}
