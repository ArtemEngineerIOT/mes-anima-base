import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickBoolean, pickNullableNumber, pickNumber, pickString } from "../release/map-release-rpc-utils";

export type AcceptRawFromEventResult = {
    machineEventSignalId: string;
    processingStatus: string;
    prefillOutputLengthM: number | null;
    prefillOutputWeightKg: number | null;
    prefillMaterialRollId: string;
    prefillBarcode: string;
    pendingCount: number;
    manualReleaseBlocked: boolean;
};

export function mapAcceptRawFromEventPayload(
    payload: ApiSchemas["OrderExecutionAcceptRawFromEventResponse"] | undefined,
): AcceptRawFromEventResult {
    const fallbackMessage = "Не удалось зарегистрировать событие списания с машины";
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
        prefillMaterialRollId:
            pickString(resultItem?.prefill_material_roll_id ?? resultItem?.prefillMaterialRollId) ?? "",
        prefillBarcode: pickString(resultItem?.prefill_barcode ?? resultItem?.prefillBarcode) ?? "",
        pendingCount,
        manualReleaseBlocked:
            pickBoolean(resultItem?.manual_release_blocked ?? resultItem?.manualReleaseBlocked) ?? false,
    };
}
