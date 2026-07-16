import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickBoolean, pickNumber, pickString } from "./map-release-rpc-utils";

export type DiscardProductionEventResult = {
    machineEventSignalId: string;
    processingStatus: string;
    pendingCount: number;
    manualReleaseBlocked: boolean;
};

export function mapDiscardProductionEventPayload(
    payload: ApiSchemas["OrderExecutionDiscardProductionEventResponse"] | undefined,
): DiscardProductionEventResult {
    const fallbackMessage = "Не удалось отклонить событие с машины";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    const pendingCount = pickNumber(resultItem?.pending_count ?? resultItem?.pendingCount) ?? 0;

    return {
        machineEventSignalId:
            pickString(resultItem?.machine_event_signal_id ?? resultItem?.machineEventSignalId) ?? "",
        processingStatus: pickString(resultItem?.processing_status ?? resultItem?.processingStatus) ?? "",
        pendingCount,
        manualReleaseBlocked:
            pickBoolean(resultItem?.manual_release_blocked ?? resultItem?.manualReleaseBlocked) ??
            pendingCount > 0,
    };
}
