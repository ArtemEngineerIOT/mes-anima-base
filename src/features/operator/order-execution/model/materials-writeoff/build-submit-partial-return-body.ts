import type { ApiSchemas } from "@/shared/api/schema";

export type SubmitPartialReturnBodyParams = {
    workAreaId: string;
    materialRollId: string;
    barcode: string;
    length: number;
    weight: number;
    warehouse: string;
    operatorRef: string;
};

export function buildSubmitPartialReturnBody(
    params: SubmitPartialReturnBodyParams,
): ApiSchemas["SubmitPartialReturnRequest"] {
    return [
        {
            workAreaId: params.workAreaId,
            materialRollId: params.materialRollId,
            barcode: params.barcode,
            length: params.length,
            weight: params.weight,
            warehouse: params.warehouse,
            operatorRef: params.operatorRef,
        },
    ];
}
