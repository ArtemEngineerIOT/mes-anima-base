import type { ApiSchemas } from "@/shared/api/schema";

import type { LocationRow } from "./material-order-workspace-mock";

export function buildMaterialOrderSubmitBlockBody(params: {
    locationRows: LocationRow[];
    locationSelectedIds: ReadonlySet<string>;
    reasonCode: string;
    comment: string;
}): ApiSchemas["SubmitBlockRequest"] {
    const seriesRefs = params.locationRows
        .filter((row) => params.locationSelectedIds.has(row.id) && row.series !== "")
        .map((row) => row.series)
        .join(",");

    return [
        {
            seriesRefs,
            reasonCode: params.reasonCode,
            comment: params.comment,
        },
    ];
}

export function collectMaterialOrderBlockSeriesRefs(
    locationRows: LocationRow[],
    locationSelectedIds: ReadonlySet<string>,
): string[] {
    return locationRows
        .filter((row) => locationSelectedIds.has(row.id) && row.series !== "")
        .map((row) => row.series);
}
