import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickBoolean, pickNumber, pickString } from "../release/map-release-rpc-utils";

export type DiscardEventRollResult = {
    machineEventSignalId: string;
    processingStatus: string;
    pendingCount: number;
    manualReleaseBlocked: boolean;
};

export function mapDiscardEventRollPayload(
    payload: ApiSchemas["OrderExecutionDiscardProductionEventResponse"] | undefined,
): DiscardEventRollResult {
    const fallbackMessage = "Не удалось отклонить событие списания с машины";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    const pendingCount = pickNumber(resultItem?.pending_count ?? resultItem?.pendingCount);

    return {
        machineEventSignalId:
            pickString(resultItem?.machine_event_signal_id ?? resultItem?.machineEventSignalId) ?? "",
        processingStatus: pickString(resultItem?.processing_status ?? resultItem?.processingStatus) ?? "",
        pendingCount,
        manualReleaseBlocked:
            pickBoolean(resultItem?.manual_release_blocked ?? resultItem?.manualReleaseBlocked) ?? false,
    };
}
