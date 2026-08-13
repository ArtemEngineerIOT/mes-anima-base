import type { ServerDataPayload } from "@/shared/lib/server-data-payload";
import { walkServerDataRowsDepthFirst } from "@/shared/lib/server-data-payload";

import type { ProductionPlanAction, ProductionStage } from "./types";
import { parseStageStatusFromBackend } from "./stage-status";

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
    const internalStageId = pickString(row, "id_operacii");
    const workAreaId = pickString(row, "work_area_id");
    const orderId = pickString(row, "order_id");
    const stageName = pickFirstString(row, "operation_name", "etap");
    const itemStageName = pickString(row, "stage_name");
    const product = pickFirstString(row, "output_item_name", "produkt", "stage_name");

    if (!stageId || !workAreaId || !orderId || !stageName) {
        return null;
    }

    const status = parseStageStatusFromBackend(row.status_code);

    return {
        stageId,
        internalStageId: internalStageId && internalStageId !== stageId ? internalStageId : undefined,
        workAreaId,
        orderId,
        projectNumber: pickFirstString(row, "project_number", "proekt"),
        client: pickString(row, "client_name"),
        clientNumber: pickString(row, "client_number"),
        product,
        itemStageName: itemStageName && itemStageName !== product ? itemStageName : undefined,
        operationNo: pickFirstString(row, "operation_number") ?? stageId,
        stageName,
        area: pickString(row, "area_name") ?? "—",
        machine:
            pickFirstString(row, "resource_id", "resource_code", "resourceCode", "resourceId") ??
            pickString(row, "resource_name"),
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
    const seenWorkAreaIds = new Set<string>();

    walkServerDataRowsDepthFirst(payload, ({ row }) => {
        const mapped = mapRow(row as Record<string, unknown>);
        if (!mapped || seenWorkAreaIds.has(mapped.workAreaId)) {
            return;
        }

        seenWorkAreaIds.add(mapped.workAreaId);
        stages.push(mapped);
    });

    return stages;
}
