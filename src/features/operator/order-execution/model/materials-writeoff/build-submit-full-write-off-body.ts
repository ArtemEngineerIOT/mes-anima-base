import type { ApiSchemas } from "@/shared/api/schema";

export type SubmitFullWriteOffBodyParams = {
    workAreaId: string;
    materialRollId: string;
    barcode: string;
    operatorRef: string;
};

export function buildSubmitFullWriteOffBody(
    params: SubmitFullWriteOffBodyParams,
): ApiSchemas["SubmitFullWriteOffRequest"] {
    return [
        {
            workAreaId: params.workAreaId,
            materialRollId: params.materialRollId,
            barcode: params.barcode,
            operatorRef: params.operatorRef,
        },
    ];
}
