import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickString } from "./map-release-rpc-utils";
import type { ReleaseBlockReason } from "./types";

function mapBlockReasonRow(row: Record<string, unknown>): ReleaseBlockReason | null {
    const reasonCode = pickString(row.reason_code ?? row.reasonCode);
    const reasonLabel = pickString(row.reason_label ?? row.reasonLabel);
    if (!reasonCode || !reasonLabel) {
        return null;
    }

    return { reasonCode, reasonLabel };
}

export function mapReleaseBlockReasonsPayload(
    payload: ApiSchemas["ListBlockReasonsResponse"] | undefined,
): ReleaseBlockReason[] {
    const fallbackMessage = "Не удалось загрузить причины блокировки";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    return (wrapper?.result ?? [])
        .map((row) => mapBlockReasonRow(row as Record<string, unknown>))
        .filter((row): row is ReleaseBlockReason => row !== null);
}
