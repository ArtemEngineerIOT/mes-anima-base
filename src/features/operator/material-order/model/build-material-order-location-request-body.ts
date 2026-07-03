import type { ApiSchemas } from "@/shared/api/schema";

import type { NomenclatureKindId } from "./types";

export function buildMaterialOrderLocationRequestBody(params: {
    resourceIds: string[];
    kindFilters: NomenclatureKindId[];
}): ApiSchemas["MachineMaterialLocationRequest"] {
    return [
        {
            resourceIds: params.resourceIds.join(","),
            includeRawMaterial: params.kindFilters.includes("raw"),
            includeSemiFinished: params.kindFilters.includes("semi"),
            includePackaging: params.kindFilters.includes("pack"),
        },
    ];
}
