import type { ApiSchemas } from "@/shared/api/schema";

export function buildReleaseRegisterBody(params: {
    workAreaId: string;
    seriesKey: string;
    length: number;
    weight: number;
    rewind: boolean;
    lastRoll: boolean;
    warehouseCode: string;
    /** Id выбранного сигнала; пустая строка — регистрация без сигнала */
    idEvent?: string;
}): ApiSchemas["OrderExecutionRegisterReleaseRequest"] {
    return [
        {
            workAreaId: params.workAreaId,
            seriesKey: params.seriesKey,
            length: params.length,
            weight: params.weight,
            rewind: params.rewind,
            lastRoll: params.lastRoll,
            warehouseCode: params.warehouseCode,
            idEvent: params.idEvent?.trim() ?? "",
        },
    ];
}
