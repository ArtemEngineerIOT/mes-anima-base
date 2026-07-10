import type { ApiSchemas } from "@/shared/api/schema";

type BuildListReturnWarehousesBodyParams = {
    workAreaId: string;
    operatorRef: string;
};

export function buildListReturnWarehousesBody(
    params: BuildListReturnWarehousesBodyParams,
): ApiSchemas["ListReturnWarehousesRequest"] {
    return [
        {
            workAreaId: params.workAreaId,
            operatorRef: params.operatorRef,
        },
    ];
}
