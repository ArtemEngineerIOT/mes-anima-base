import type { ApiSchemas } from "@/shared/api/schema";

import { mapMaterialsStageOperations } from "./map-materials-stage-operation";
import type { MaterialsStageRegistrySnapshot } from "./types";

const OK_ERROR_CODE = "OK";

const EMPTY_SNAPSHOT: MaterialsStageRegistrySnapshot = {
    rows: [],
    asOf: null,
    workAreaId: null,
};

function pickString(value: unknown): string | null {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    return null;
}

export function mapMaterialsStageRegistryPayload(
    payload: ApiSchemas["OrderExecutionMaterialStageRegistryResponse"] | undefined,
): MaterialsStageRegistrySnapshot {
    const fallbackMessage = "Не удалось загрузить списания и возвраты на этапе";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    const wrapperRecord = wrapper as Record<string, unknown>;

    return {
        rows: mapMaterialsStageOperations(wrapper.result),
        asOf: pickString(wrapperRecord.as_of ?? wrapperRecord.asOf),
        workAreaId: pickString(wrapperRecord.work_area_id ?? wrapperRecord.workAreaId),
    };
}

export { EMPTY_SNAPSHOT as MATERIALS_STAGE_REGISTRY_EMPTY_SNAPSHOT };
