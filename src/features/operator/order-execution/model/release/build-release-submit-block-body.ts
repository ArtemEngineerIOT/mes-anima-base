import type { ApiSchemas } from "@/shared/api/schema";

import type { ReleaseInputRollRow } from "./types";

export function buildReleaseSubmitBlockBody(params: {
    inputRolls: ReleaseInputRollRow[];
    selectedInputRollIds: readonly string[];
    reasonCode: string;
    comment: string;
}): ApiSchemas["SubmitBlockRequest"] {
    const seriesRefs = params.inputRolls
        .filter((row) => params.selectedInputRollIds.includes(row.id) && row.externalSeriesKey !== "")
        .map((row) => row.externalSeriesKey)
        .join(",");

    return [
        {
            seriesRefs,
            reasonCode: params.reasonCode,
            comment: params.comment,
        },
    ];
}
