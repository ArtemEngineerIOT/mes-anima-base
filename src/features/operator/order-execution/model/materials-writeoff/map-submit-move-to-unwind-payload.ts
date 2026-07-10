import type { ApiSchemas } from "@/shared/api/schema";

import type { MaterialsSubmitMoveToUnwindResult } from "./types";

const OK_ERROR_CODE = "OK";

function pickBoolean(value: unknown): boolean {
    if (typeof value === "boolean") {
        return value;
    }
    if (value === 1 || value === "1" || value === "true" || value === "TRUE") {
        return true;
    }
    return false;
}

function pickString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

export function mapSubmitMoveToUnwindPayload(
    payload: ApiSchemas["OrderExecutionSubmitMoveToUnwindResponse"] | undefined,
): MaterialsSubmitMoveToUnwindResult {
    const fallbackMessage = "Не удалось переместить рулон на размотку";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    const result = (wrapper.result?.[0] ?? undefined) as Record<string, unknown> | undefined;

    return {
        materialRollId: pickString(result?.material_roll_id ?? result?.materialRollId),
        presenceStatus: pickString(result?.presence_status ?? result?.presenceStatus),
        presenceRefreshHint: pickBoolean(result?.presence_refresh_hint ?? result?.presenceRefreshHint),
        stageRegistryRefreshHint: pickBoolean(
            result?.stage_registry_refresh_hint ?? result?.stageRegistryRefreshHint,
        ),
    };
}
