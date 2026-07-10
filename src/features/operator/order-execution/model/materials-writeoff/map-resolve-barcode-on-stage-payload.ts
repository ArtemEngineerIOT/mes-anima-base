import type { ApiSchemas } from "@/shared/api/schema";

import type { MaterialsResolveBarcodeOnStageResult } from "./types";

const OK_ERROR_CODE = "OK";

function pickString(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    return undefined;
}

function pickBoolean(value: unknown): boolean {
    if (typeof value === "boolean") {
        return value;
    }
    if (value === 1 || value === "1" || value === "true" || value === "TRUE") {
        return true;
    }
    return false;
}

export function mapResolveBarcodeOnStagePayload(
    payload: ApiSchemas["OrderExecutionResolveBarcodeOnStageResponse"] | undefined,
): MaterialsResolveBarcodeOnStageResult {
    const fallbackMessage = "Не удалось зарегистрировать рулон в машине";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    const result = (wrapper.result?.[0] ?? undefined) as Record<string, unknown> | undefined;
    if (!result) {
        throw new Error(fallbackMessage);
    }

    return {
        stageSpecStatus: pickString(result.stage_spec_status ?? result.stageSpecStatus) ?? "",
        stageSpecBannerVisible: pickBoolean(result.stage_spec_banner_visible ?? result.stageSpecBannerVisible),
        stageSpecBannerTitle: pickString(result.stage_spec_banner_title ?? result.stageSpecBannerTitle) ?? "",
        stageSpecBannerDetail: pickString(result.stage_spec_banner_detail ?? result.stageSpecBannerDetail) ?? "",
        alreadyRegisteredOnStage: pickBoolean(result.already_registered_on_stage ?? result.alreadyRegisteredOnStage),
        scanBlockedByActiveInput: pickBoolean(
            result.scan_blocked_by_active_input ?? result.scanBlockedByActiveInput,
        ),
        materialRollId: pickString(result.material_roll_id ?? result.materialRollId) ?? "",
        rollTraceContextId: pickString(result.roll_trace_context_id ?? result.rollTraceContextId) ?? "",
        presenceStatus: pickString(result.presence_status ?? result.presenceStatus) ?? "",
        presenceRefreshHint: pickBoolean(result.presence_refresh_hint ?? result.presenceRefreshHint),
        stageRegistryRefreshHint: pickBoolean(result.stage_registry_refresh_hint ?? result.stageRegistryRefreshHint),
    };
}
