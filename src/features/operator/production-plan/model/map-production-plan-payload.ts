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

function pickFirstString(row: Record<string, unknown>, ...keys: string[]): string | undefined {
    for (const key of keys) {
        const value = pickString(row, key);
        if (value) {
            return value;
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
    const stageId = pickFirstString(row, "operation_number", "id_operacii");
    const workAreaId = pickString(row, "work_area_id");
    const orderId = pickString(row, "order_id");
    const stageName = pickFirstString(row, "operation_name", "etap");

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
        product: pickFirstString(row, "output_item_name", "produkt", "stage_name"),
        operationNo: stageId,
        stageName,
        area: pickString(row, "area_name") ?? "—",
        machine: pickString(row, "resource_id") ?? pickString(row, "resource_name"),
        quantity: pickNumber(row, "output_quantity"),
        unit: pickString(row, "output_unit"),
        orderDate: pickString(row, "client_order_date"),
        startAt: pickFirstString(row, "planned_start", "actual_start"),
        endAt: pickFirstString(row, "planned_finish", "actual_end"),
        status,
        statusDisplayLabel: pickFirstString(row, "status_label", "status"),
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
