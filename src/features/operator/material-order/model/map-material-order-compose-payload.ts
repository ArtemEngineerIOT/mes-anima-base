import type { ApiSchemas } from "@/shared/api/schema";

import type { MaterialOrderLine } from "./material-order-workspace-mock";

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

function mapComposeLine(row: Record<string, unknown>, index: number): MaterialOrderLine | null {
    const nomenclature = pickString(row, "nomenclature_code", "nomenclatureCode") ?? "";
    const nomenclatureName = pickString(row, "nomenclature_name", "nomenclatureName") ?? "";
    if (!nomenclature && !nomenclatureName) {
        return null;
    }

    const lineNo = pickNumber(row, "line_no", "lineNo");
    const id =
        lineNo !== undefined
            ? String(lineNo)
            : (pickString(row, "line_id", "lineId", "id") ?? `line-${index + 1}`);
    const requestedQty = pickNumber(row, "requested_quantity", "requestedQuantity", "quantity") ?? 0;
    const quantityUom = pickString(row, "quantity_uom", "quantityUom", "unit", "uom") ?? "—";

    return {
        id,
        nomenclature,
        nomenclatureName,
        series: pickString(row, "series", "series_code", "seriesCode") ?? "",
        requestedQty,
        quantityUom,
        isSemiFinished: pickBoolean(row, "semi_finished_pick_required", "semiFinishedPickRequired", "is_semi_finished", "isSemiFinished"),
        isFilm: pickBoolean(row, "is_film", "isFilm"),
    };
}

export type MaterialOrderComposeResult = {
    composeSessionId: string;
    pickToggleEnabled: boolean;
    lines: MaterialOrderLine[];
};

export function mapMaterialOrderComposePayload(
    payload: ApiSchemas["MaterialOrderComposeResponse"] | undefined,
): MaterialOrderComposeResult {
    const fallbackMessage = "Не удалось сформировать заказ";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    const lines = (wrapper.result ?? [])
        .map((row, index) => mapComposeLine(row as Record<string, unknown>, index))
        .filter((row): row is MaterialOrderLine => row !== null);

    return {
        composeSessionId:
            (typeof wrapper.compose_session_id === "string" && wrapper.compose_session_id.trim()) ||
            (typeof wrapper.composeSessionId === "string" && wrapper.composeSessionId.trim()) ||
            "",
        pickToggleEnabled: Boolean(wrapper.pick_toggle_enabled ?? wrapper.pickToggleEnabled),
        lines,
    };
}
