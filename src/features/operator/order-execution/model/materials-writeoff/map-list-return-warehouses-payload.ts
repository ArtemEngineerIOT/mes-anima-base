import type { ApiSchemas } from "@/shared/api/schema";

import type { MaterialsReturnWarehouseOption } from "./types";

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

function mapReturnWarehouseOption(row: Record<string, unknown>): MaterialsReturnWarehouseOption | null {
    const warehouseCode = pickString(row.warehouse_code ?? row.warehouseCode);
    if (!warehouseCode) {
        return null;
    }

    return {
        warehouseCode,
        warehouseLabel: pickString(row.warehouse_label ?? row.warehouseLabel) ?? warehouseCode,
    };
}

export function mapListReturnWarehousesPayload(
    payload: ApiSchemas["ListReturnWarehousesResponse"] | undefined,
): MaterialsReturnWarehouseOption[] {
    const fallbackMessage = "Не удалось загрузить склады";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    return (wrapper.result ?? [])
        .map((row) => mapReturnWarehouseOption(row as Record<string, unknown>))
        .filter((row): row is MaterialsReturnWarehouseOption => row !== null);
}
