import type { ApiSchemas } from "@/shared/api/schema";
import { assertReleaseRpcOk, pickNumber, pickString } from "../release/map-release-rpc-utils";
import { MONITORING_EMPTY_STAGE_EVENTS, type MonitoringStageEventRow } from "./types";

const STAGE_EVENT_ROW_ORDER: Record<string, number> = {
    DEFECT: 0,
    DOWNTIME: 1,
    SETUP: 2,
};

function readTableRows(value: unknown): unknown[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
        const obj = value as Record<string, unknown>;

        if (Array.isArray(obj.records)) {
            return obj.records;
        }

        if (Array.isArray(obj.table)) {
            return obj.table;
        }
    }

    return [];
}

function readEventSummaryRows(resultItem: Record<string, unknown>): unknown[] {
    const direct = readTableRows(resultItem.event_summary_rows ?? resultItem.eventSummaryRows);
    if (direct.length > 0) {
        return direct;
    }

    const nested = readTableRows(resultItem.event_summary ?? resultItem.eventSummary);
    return nested;
}

function mapStageEventRow(row: Record<string, unknown>): MonitoringStageEventRow | null {
    const label = pickString(row.row_label ?? row.rowLabel);
    const uom = pickString(row.quantity_uom ?? row.quantityUom);
    const quantity = pickNumber(row.quantity);

    if (!label) {
        return null;
    }

    return {
        label,
        uom: uom ?? "—",
        quantity,
    };
}

function sortStageEventRows(rows: MonitoringStageEventRow[], sourceRows: unknown[]): MonitoringStageEventRow[] {
    const orderByIndex = new Map<string, number>();

    sourceRows.forEach((row, index) => {
        if (!row || typeof row !== "object") {
            return;
        }

        const record = row as Record<string, unknown>;
        const kind = pickString(record.row_kind ?? record.rowKind)?.toUpperCase();
        const label = pickString(record.row_label ?? record.rowLabel);
        const order = kind ? STAGE_EVENT_ROW_ORDER[kind] : undefined;

        if (label !== undefined) {
            orderByIndex.set(label, order ?? index);
        }
    });

    return [...rows].sort((left, right) => {
        const leftOrder = orderByIndex.get(left.label) ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = orderByIndex.get(right.label) ?? Number.MAX_SAFE_INTEGER;
        return leftOrder - rightOrder;
    });
}

export function mapMonitoringStageEventsPayload(
    payload: ApiSchemas["OrderExecutionMonitoringStageEventsResponse"] | undefined,
): MonitoringStageEventRow[] {
    const fallbackMessage = "Не удалось загрузить события по этапу";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    if (!resultItem) {
        return MONITORING_EMPTY_STAGE_EVENTS;
    }

    const sourceRows = readEventSummaryRows(resultItem);
    const mappedRows = sourceRows
        .map((row) => mapStageEventRow(row as Record<string, unknown>))
        .filter((row): row is MonitoringStageEventRow => row !== null);

    return sortStageEventRows(mappedRows, sourceRows);
}
