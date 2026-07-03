import type { ApiSchemas } from "@/shared/api/schema";

import type { LocationRow, LocationStatusKey } from "./material-order-workspace-mock";
import type { NomenclatureKindId } from "./types";

const OK_ERROR_CODE = "OK";

function pickString(row: Record<string, unknown>, ...keys: string[]): string | undefined {
    for (const key of keys) {
        const value = row[key];
        if (typeof value === "string") {
            return value;
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

function mapKindId(kindLabel: string): NomenclatureKindId {
    const normalized = kindLabel.trim().toLowerCase();
    if (normalized.includes("упаков")) {
        return "pack";
    }
    if (normalized.includes("полуф") || normalized === "пф") {
        return "semi";
    }
    return "raw";
}

function mapLocationStatus(row: Record<string, unknown>): LocationStatusKey {
    if (pickBoolean(row, "blocked")) {
        return "blocked";
    }

    const label = (pickString(row, "status_label", "statusLabel") ?? "").toLowerCase();
    if (label.includes("заказ")) {
        return "ordered";
    }
    if (label.includes("блок")) {
        return "blocked";
    }
    return "available";
}

function mapLocationRow(row: Record<string, unknown>, index: number): LocationRow | null {
    const machineId = pickString(row, "resource_id", "resourceId")?.trim();
    const nomenclature = pickString(row, "nomenclature_name", "nomenclatureName")?.trim();
    if (!machineId || !nomenclature) {
        return null;
    }

    const kindLabel = pickString(row, "nomenclature_kind_label", "nomenclatureKindLabel") ?? "—";
    const series = pickString(row, "series_ref", "seriesRef") ?? "";
    const id = `${machineId}-${series || nomenclature}-${index}`;

    return {
        id,
        machineId,
        nomenclature,
        kind: mapKindId(kindLabel),
        kindLabel,
        series,
        quantity: pickNumber(row, "quantity") ?? 0,
        unit: pickString(row, "quantity_uom", "quantityUom") ?? "—",
        status: mapLocationStatus(row),
        frCode: pickString(row, "fr_code", "frCode") || null,
        blocked: pickBoolean(row, "blocked"),
        rowSelectable: pickBoolean(row, "row_selectable", "rowSelectable"),
        blockReasonCode: pickString(row, "block_reason_code", "blockReasonCode") ?? "",
        expiryDate: pickString(row, "expiry_date", "expiryDate") ?? "",
    };
}

export type MaterialOrderLocationResult = {
    rows: LocationRow[];
    asOf: string;
};

export function mapMaterialOrderLocationPayload(
    payload: ApiSchemas["MachineMaterialLocationResponse"] | undefined,
): MaterialOrderLocationResult {
    const fallbackMessage = "Не удалось загрузить локацию";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    const rows = (wrapper.result ?? [])
        .map((row, index) => mapLocationRow(row as Record<string, unknown>, index))
        .filter((row): row is LocationRow => row !== null);

    return {
        rows,
        asOf: (typeof wrapper.as_of === "string" && wrapper.as_of.trim()) || "",
    };
}
