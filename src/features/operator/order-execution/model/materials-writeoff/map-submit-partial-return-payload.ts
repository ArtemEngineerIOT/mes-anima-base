import type { ApiSchemas } from "@/shared/api/schema";

import type { MaterialsSubmitPartialReturnResult } from "./types";

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

export function mapSubmitPartialReturnPayload(
    payload: ApiSchemas["SubmitPartialReturnResponse"] | undefined,
): MaterialsSubmitPartialReturnResult {
    const fallbackMessage = "Не удалось отразить возврат";
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
        presenceRefreshHint: pickBoolean(result?.presence_refresh_hint ?? result?.presenceRefreshHint),
        stageRegistryRefreshHint: pickBoolean(
            result?.stage_registry_refresh_hint ?? result?.stageRegistryRefreshHint,
        ),
    };
}
