import type { ApiSchemas } from "@/shared/api/schema";

export function buildReleaseRegisterBody(params: {
    workAreaId: string;
    seriesKey: string;
    length: number;
    weight: number;
    rewind: boolean;
    warehouseCode: string;
}): ApiSchemas["OrderExecutionRegisterReleaseRequest"] {
    return [
        {
            workAreaId: params.workAreaId,
            seriesKey: params.seriesKey,
            length: params.length,
            weight: params.weight,
            rewind: params.rewind,
            warehouseCode: params.warehouseCode,
        },
    ];
}
