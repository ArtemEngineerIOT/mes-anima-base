import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickNumber } from "../../release/map-release-rpc-utils";
import { ROLL_WRITE_OFF_EVENTS_SUMMARY_EMPTY, type RollWriteOffEventsSummarySnapshot } from "./types";

export function mapRollWriteOffEventsSummaryPayload(
    payload: ApiSchemas["OrderExecutionRollWriteOffEventsSummaryResponse"] | undefined,
): RollWriteOffEventsSummarySnapshot {
    const fallbackMessage = "Не удалось загрузить сводку событий списания";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    if (!resultItem) {
        return ROLL_WRITE_OFF_EVENTS_SUMMARY_EMPTY;
    }

    return {
        totalCount: pickNumber(resultItem.total_count ?? resultItem.totalCount),
    };
}
