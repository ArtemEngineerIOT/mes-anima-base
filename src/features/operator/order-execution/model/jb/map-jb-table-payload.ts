import type { ApiSchemas } from "@/shared/api/schema";

import { pickBoolean, pickString } from "../release/map-release-rpc-utils";
import type {
    JobBagDocumentGroup,
    JobBagDocumentRow,
    JobBagDocumentStatus,
    OperatorJbPanel,
} from "../types";
import { JB_TABLE_NUMERIC_ID_TO_ROW_ID, JB_WHOLE_DOCUMENT_ROW_ID } from "./constants";

const BY_SHEET_GROUP: JobBagDocumentGroup = {
    id: "by_sheet",
    title: "ПО ЛИСТАМ",
    rows: [],
};

const WHOLE_DOCUMENT_GROUP: JobBagDocumentGroup = {
    id: "whole_document",
    title: "ВЕСЬ ДОКУМЕНТ",
    rows: [],
};

function defaultStatusLabel(status: JobBagDocumentStatus): string {
    return status === "ready_for_print" ? "ГОТОВ К ПЕЧАТИ" : "ПОДГОТОВКА";
}

function mapStatus(value: unknown): JobBagDocumentStatus {
    return pickBoolean(value) ? "ready_for_print" : "preparation";
}

function readNumericId(row: Record<string, unknown>): number | null {
    const value = row.id;
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return null;
}

function mapTableRow(row: Record<string, unknown>, index: number): JobBagDocumentRow | null {
    const numericId = readNumericId(row);
    const id =
        (numericId !== null ? JB_TABLE_NUMERIC_ID_TO_ROW_ID[numericId] : undefined) ??
        pickString(row.row_id ?? row.rowId) ??
        `jb-row-${index + 1}`;
    const label = pickString(row.description ?? row.label ?? row.name);
    if (!label) {
        return null;
    }

    const status = mapStatus(row.status);
    const statusLabel =
        pickString(row.status_label ?? row.statusLabel)?.toUpperCase() ?? defaultStatusLabel(status);

    return {
        id,
        label,
        status,
        statusLabel,
        printEnabled: pickBoolean(row.action),
    };
}

function splitRowsIntoGroups(rows: JobBagDocumentRow[]): JobBagDocumentGroup[] {
    const bySheetRows = rows.filter((row) => row.id !== JB_WHOLE_DOCUMENT_ROW_ID);
    const wholeDocumentRows = rows.filter((row) => row.id === JB_WHOLE_DOCUMENT_ROW_ID);

    const groups: JobBagDocumentGroup[] = [];

    if (bySheetRows.length > 0) {
        groups.push({
            ...BY_SHEET_GROUP,
            rows: bySheetRows,
        });
    }

    if (wholeDocumentRows.length > 0) {
        groups.push({
            ...WHOLE_DOCUMENT_GROUP,
            rows: wholeDocumentRows,
        });
    }

    return groups;
}

export function mapJbTablePayload(
    payload: ApiSchemas["OrderExecutionGetJbTableResponse"] | undefined,
): OperatorJbPanel {
    if (!Array.isArray(payload)) {
        throw new Error("Не удалось загрузить таблицу JB");
    }

    const rows = payload
        .map((row, index) => mapTableRow(row as Record<string, unknown>, index))
        .filter((row): row is JobBagDocumentRow => row !== null);

    const preparationCount = rows.filter((row) => row.status === "preparation").length;

    return {
        groups: splitRowsIntoGroups(rows),
        headerCount: preparationCount > 0 ? preparationCount : undefined,
    };
}
