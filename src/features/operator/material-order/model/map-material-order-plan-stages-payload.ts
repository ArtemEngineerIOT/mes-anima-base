import type { ApiSchemas } from "@/shared/api/schema";

import type { MaterialOrderPlanStage } from "./types";

const OK_ERROR_CODE = "OK";

function pickString(row: Record<string, unknown>, ...keys: string[]): string | undefined {
    for (const key of keys) {
        const value = row[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
        if (typeof value === "number" && Number.isFinite(value)) {
            return String(value);
        }
    }
    return undefined;
}

function pickNumber(row: Record<string, unknown>, key: string): number | undefined {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return undefined;
}

function formatPlanDateTime(value: string | undefined): string {
    if (!value?.trim()) {
        return "—";
    }
    return value.trim().slice(0, 16).replace("T", " ");
}

function formatQuantity(quantity: number | undefined, unit: string | undefined): string {
    if (quantity == null) {
        return "—";
    }
    const formatted = new Intl.NumberFormat("ru-RU").format(quantity);
    return unit ? `${formatted} ${unit}` : formatted;
}

function mapStageRow(row: Record<string, unknown>): MaterialOrderPlanStage | null {
    const workAreaId = pickString(row, "work_area_id", "workAreaId");
    const stage = pickString(row, "etap", "stage");
    const orderId = pickString(row, "order_id", "orderId");

    if (!workAreaId || !stage || !orderId) {
        return null;
    }

    const quantity = pickNumber(row, "output_quantity") ?? pickNumber(row, "outputQuantity");
    const unit = pickString(row, "output_unit", "outputUnit");

    return {
        id: workAreaId,
        workAreaId,
        stage,
        orderId,
        orderDate: formatPlanDateTime(pickString(row, "client_order_date", "clientOrderDate")),
        client: pickString(row, "client_name", "clientName") ?? "—",
        product: pickString(row, "produkt", "product", "output_item_name", "outputItemName") ?? "—",
        quantity: formatQuantity(quantity, unit),
        startAt: formatPlanDateTime(pickString(row, "planned_start", "plannedStart", "actual_start", "actualStart")),
        endAt: formatPlanDateTime(pickString(row, "planned_finish", "plannedFinish", "actual_end", "actualEnd")),
    };
}

export type MaterialOrderPlanStagesSnapshot = {
    resourceCode: string;
    stages: MaterialOrderPlanStage[];
};

export function mapMaterialOrderPlanStagesPayload(
    payload: ApiSchemas["MaterialOrderPlanStagesResponse"] | undefined,
    fallbackResourceCode: string,
): MaterialOrderPlanStagesSnapshot {
    const fallbackMessage = "Не удалось загрузить этапы производственного плана";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    const resourceCode =
        (typeof wrapper.resource_id === "string" && wrapper.resource_id.trim()) ||
        fallbackResourceCode.trim();

    const stages = (wrapper.result ?? [])
        .map((row) => mapStageRow(row as Record<string, unknown>))
        .filter((row): row is MaterialOrderPlanStage => row !== null);

    return { resourceCode, stages };
}
