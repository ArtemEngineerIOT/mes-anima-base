import type { ApiSchemas } from "@/shared/api/schema";

import type { MaterialsInstallationPlace } from "./materials-writeoff-form";

export type ResolveBarcodeOnStageBodyParams = {
    workAreaId: string;
    barcode: string;
    installationPlace: MaterialsInstallationPlace;
    operatorRef: string;
};

export function buildResolveBarcodeOnStageBody(
    params: ResolveBarcodeOnStageBodyParams,
): ApiSchemas["OrderExecutionResolveBarcodeOnStageRequest"] {
    return [
        {
            workAreaId: params.workAreaId,
            barcode: params.barcode,
            installationPlace: params.installationPlace,
            operatorRef: params.operatorRef,
        },
    ];
}
