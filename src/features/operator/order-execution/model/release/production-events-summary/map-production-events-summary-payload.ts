import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickNumber } from "../map-release-rpc-utils";
import {
    RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY,
    type ReleaseProductionEventsSummarySnapshot,
} from "./types";

export function mapProductionEventsSummaryPayload(
    payload: ApiSchemas["OrderExecutionReleaseProductionEventsSummaryResponse"] | undefined,
): ReleaseProductionEventsSummarySnapshot {
    const fallbackMessage = "Не удалось загрузить сводку событий выпуска";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    if (!resultItem) {
        return RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY;
    }

    return {
        totalCount: pickNumber(resultItem.total_count ?? resultItem.totalCount),
    };
}
