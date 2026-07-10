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

function readRegistryRows(snapshot: Record<string, unknown> | undefined): unknown {
    if (!snapshot) {
        return [];
    }

    return snapshot.rows ?? snapshot.registry_rows ?? snapshot.registryRows ?? [];
}

function resolveRegistrySnapshot(wrapper: Record<string, unknown>): Record<string, unknown> | undefined {
    const result = wrapper.result;
    if (!Array.isArray(result) || result.length === 0) {
        return undefined;
    }

    const first = result[0];
    if (!first || typeof first !== "object") {
        return undefined;
    }

    const snapshot = first as Record<string, unknown>;
    const hasSnapshotShape =
        "rows" in snapshot ||
        "registry_rows" in snapshot ||
        "registryRows" in snapshot ||
        "work_area_id" in snapshot ||
        "workAreaId" in snapshot ||
        "as_of" in snapshot ||
        "asOf" in snapshot;

    if (hasSnapshotShape) {
        return snapshot;
    }

    return {
        work_area_id: wrapper.work_area_id ?? wrapper.workAreaId,
        as_of: wrapper.as_of ?? wrapper.asOf,
        rows: result,
    };
}

export function mapStageRollRegistryPayload(
    payload: ApiSchemas["OrderExecutionStageRollRegistryResponse"] | undefined,
): MaterialsStageRegistrySnapshot {
    const fallbackMessage = "Не удалось загрузить выполненные операции на этапе";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    const wrapperRecord = wrapper as Record<string, unknown>;
    const snapshot = resolveRegistrySnapshot(wrapperRecord);

    return {
        rows: mapMaterialsStageOperations(readRegistryRows(snapshot)),
        asOf:
            pickString(snapshot?.as_of ?? snapshot?.asOf) ??
            pickString(wrapperRecord.as_of ?? wrapperRecord.asOf),
        workAreaId:
            pickString(snapshot?.work_area_id ?? snapshot?.workAreaId) ??
            pickString(wrapperRecord.work_area_id ?? wrapperRecord.workAreaId),
    };
}

export { EMPTY_SNAPSHOT as MATERIALS_STAGE_REGISTRY_EMPTY_SNAPSHOT };
