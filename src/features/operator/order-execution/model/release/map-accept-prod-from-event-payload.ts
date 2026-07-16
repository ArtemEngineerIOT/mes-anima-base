import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickBoolean, pickNullableNumber, pickNumber, pickString } from "./map-release-rpc-utils";

export type AcceptProdFromEventResult = {
    machineEventSignalId: string;
    processingStatus: string;
    prefillOutputLengthM: number | null;
    prefillOutputWeightKg: number | null;
    pendingCount: number;
    manualReleaseBlocked: boolean;
};

export function mapAcceptProdFromEventPayload(
    payload: ApiSchemas["OrderExecutionAcceptProdFromEventResponse"] | undefined,
): AcceptProdFromEventResult {
    const fallbackMessage = "Не удалось зарегистрировать событие выпуска с машины";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    const pendingCount = pickNumber(resultItem?.pending_count ?? resultItem?.pendingCount);

    return {
        machineEventSignalId:
            pickString(resultItem?.machine_event_signal_id ?? resultItem?.machineEventSignalId) ?? "",
        processingStatus: pickString(resultItem?.processing_status ?? resultItem?.processingStatus) ?? "",
        prefillOutputLengthM: pickNullableNumber(
            resultItem?.prefill_output_length_m ?? resultItem?.prefillOutputLengthM,
        ),
        prefillOutputWeightKg: pickNullableNumber(
            resultItem?.prefill_output_weight_kg ?? resultItem?.prefillOutputWeightKg,
        ),
        pendingCount,
        manualReleaseBlocked:
            pickBoolean(resultItem?.manual_release_blocked ?? resultItem?.manualReleaseBlocked) ??
            pendingCount > 0,
    };
}
