import type { ApiSchemas } from "@/shared/api/schema";

import type { ReleaseBatchRow } from "./types";

export function collectReleaseBlockSeriesRefs(
    batchRolls: ReleaseBatchRow[],
    selectedBatchRollIds: ReadonlySet<string>,
): string[] {
    return batchRolls
        .filter((row) => selectedBatchRollIds.has(row.id) && row.externalSeriesKey.trim() !== "")
        .map((row) => row.externalSeriesKey.trim());
}

export function buildReleaseSubmitBlockBody(params: {
    batchRolls: ReleaseBatchRow[];
    selectedBatchRollIds: ReadonlySet<string>;
    reasonCode: string;
    comment: string;
}): ApiSchemas["SubmitBlockRequest"] {
    const seriesRefs = collectReleaseBlockSeriesRefs(params.batchRolls, params.selectedBatchRollIds).join(",");

    return [
        {
            seriesRefs,
            reasonCode: params.reasonCode,
            comment: params.comment,
        },
    ];
}
