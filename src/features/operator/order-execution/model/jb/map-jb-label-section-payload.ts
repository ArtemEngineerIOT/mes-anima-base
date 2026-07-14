import type { ApiSchemas } from "@/shared/api/schema";

import { mapPrintMaterialReturnLabelPayload } from "../materials-writeoff/map-print-material-return-label-payload";

export function mapJbLabelSectionPayload(
    payload: ApiSchemas["JbLabelSectionResponse"] | undefined,
): string {
    return mapPrintMaterialReturnLabelPayload(
        payload as ApiSchemas["OrderExecutionMaterialReturnLabelResponse"] | undefined,
    );
}
