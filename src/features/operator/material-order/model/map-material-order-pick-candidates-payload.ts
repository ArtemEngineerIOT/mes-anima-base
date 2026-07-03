import type { ApiSchemas } from "@/shared/api/schema";

import type { RollPickRow } from "./material-order-workspace-mock";

const OK_ERROR_CODE = "OK";

function pickString(row: Record<string, unknown>, ...keys: string[]): string | undefined {
    for (const key of keys) {
        const value = row[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
}

function pickNumber(row: Record<string, unknown>, ...keys: string[]): number | undefined {
    for (const key of keys) {
        const value = row[key];
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
            return Number(value);
        }
    }
    return undefined;
}

function pickBoolean(row: Record<string, unknown>, ...keys: string[]): boolean {
    for (const key of keys) {
        const value = row[key];
        if (typeof value === "boolean") {
            return value;
        }
    }
    return false;
}

function mapPickCandidate(row: Record<string, unknown>): RollPickRow | null {
    const lotRef = pickString(row, "lot_ref", "lotRef");
    const nomenclature =
        pickString(row, "nomenclature_code", "nomenclatureCode") ??
        pickString(row, "nomenclature_name", "nomenclatureName") ??
        pickString(row, "nomenclature");
    if (!lotRef || !nomenclature) {
        return null;
    }

    return {
        id: lotRef,
        nomenclature,
        series: lotRef,
        availableQuantity:
            pickNumber(row, "available_quantity", "availableQuantity", "quantity", "requested_quantity") ?? 0,
        unit: pickString(row, "quantity_uom", "quantityUom", "unit", "uom") ?? "—",
        expiresAt: pickString(row, "expires_at", "expiresAt") ?? "—",
        blocked: pickBoolean(row, "blocked"),
    };
}

export function mapMaterialOrderPickCandidatesPayload(
    payload: ApiSchemas["MaterialOrderPickCandidatesResponse"] | undefined,
): RollPickRow[] {
    const fallbackMessage = "Не удалось загрузить рулоны";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    return (wrapper.result ?? [])
        .map((row) => mapPickCandidate(row as Record<string, unknown>))
        .filter((row): row is RollPickRow => row !== null);
}
