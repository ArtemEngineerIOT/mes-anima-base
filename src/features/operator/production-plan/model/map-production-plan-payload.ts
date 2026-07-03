import type { ServerDataPayload } from "@/shared/lib/server-data-payload";

import type { ProductionPlanAction, ProductionStage, StageStatus } from "./types";

function pickString(row: Record<string, unknown>, key: string): string | undefined {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
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

function parseStageStatus(statusCode: unknown): StageStatus {
    const normalized = String(statusCode ?? "PLANNED")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");

    switch (normalized) {
        case "PLANNED":
            return "planned";
        case "IN_PROGRESS":
        case "INPROGRESS":
            return "in_progress";
        case "PAUSED":
            return "paused";
        case "DONE":
        case "COMPLETED":
            return "done";
        case "CANCELLED":
        case "CANCELED":
            return "cancelled";
        default:
            return "planned";
    }
}

function parseAllowedActions(raw: unknown): ProductionPlanAction[] | undefined {
    if (typeof raw !== "string" || !raw.trim()) {
        return undefined;
    }

    try {
        const parsed = JSON.parse(raw) as { records?: { action?: string }[] };
        const actions = parsed.records
            ?.map((record) => record.action?.trim().toLowerCase())
            .filter((action): action is ProductionPlanAction =>
                action === "start" || action === "pause" || action === "continue",
            );

        return actions && actions.length > 0 ? actions : undefined;
    } catch {
        return undefined;
    }
}

function mapRow(row: Record<string, unknown>): ProductionStage | null {
    const stageId = pickString(row, "id_operacii");
    const workAreaId = pickString(row, "work_area_id");
    const orderId = pickString(row, "order_id");
    const stageName = pickString(row, "etap");

    if (!stageId || !workAreaId || !orderId || !stageName) {
        return null;
    }

    const status = parseStageStatus(row.status_code);

    return {
        stageId,
        workAreaId,
        orderId,
        client: pickString(row, "client_name"),
        clientNumber: pickString(row, "client_number"),
        product: pickString(row, "produkt") ?? pickString(row, "output_item_name"),
        operationNo: stageId,
        stageName,
        area: pickString(row, "area_name") ?? "—",
        machine: pickString(row, "resource_id") ?? pickString(row, "resource_name"),
        quantity: pickNumber(row, "output_quantity"),
        unit: pickString(row, "output_unit"),
        orderDate: pickString(row, "client_order_date"),
        startAt: pickString(row, "planned_start") ?? pickString(row, "actual_start"),
        endAt: pickString(row, "planned_finish") ?? pickString(row, "actual_end"),
        status,
        statusDisplayLabel: pickString(row, "status"),
        allowedActions: parseAllowedActions(row.allowed_actions),
        hasPrevUnfinished: row.has_prev_unfinished === true,
    };
}

export function mapProductionPlanPayload(payload: ServerDataPayload): ProductionStage[] {
    const stages: ProductionStage[] = [];

    for (const row of payload) {
        const mapped = mapRow(row as Record<string, unknown>);
        if (mapped) {
            stages.push(mapped);
        }
    }

    return stages;
}
