import type { ApiSchemas } from "@/shared/api/schema";

const OK_ERROR_CODE = "OK";

export type RegisterMaterialReturnResult = {
    stageRegistryRefreshHint: boolean;
};

export function mapRegisterMaterialReturnPayload(
    payload: ApiSchemas["OrderExecutionMaterialReturnResponse"] | undefined,
): RegisterMaterialReturnResult {
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
        stageRegistryRefreshHint: Boolean(
            result?.stage_registry_refresh_hint ?? result?.stageRegistryRefreshHint,
        ),
    };
}
