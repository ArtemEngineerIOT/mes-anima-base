import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickBoolean, pickNumber, pickNullableNumber, pickString } from "./map-release-rpc-utils";
import {
    RELEASE_EMPTY_PRODUCTION_EVENT,
    RELEASE_PRODUCTION_EVENT_DEFAULT_COLUMNS,
    type ReleaseProductionCurrentEvent,
    type ReleaseProductionEventColumn,
    type ReleaseProductionEventDisplayRow,
    type ReleaseProductionEventListRow,
    type ReleaseProductionEventSnapshot,
} from "./production-event-types";

function mapDisplayRow(row: Record<string, unknown>): ReleaseProductionEventDisplayRow | null {
    const characteristic =
        pickString(row.characteristic_label ?? row.characteristicLabel) ?? "";
    if (!characteristic) {
        return null;
    }

    const value = pickString(row.value_text ?? row.valueText) ?? "—";
    const unit = pickString(row.unit_label ?? row.unitLabel) ?? "—";

    return { characteristic, value, unit };
}

function mapCurrentEvent(row: Record<string, unknown> | undefined): ReleaseProductionCurrentEvent | null {
    if (!row) {
        return null;
    }

    const machineEventSignalId = pickString(row.machine_event_signal_id ?? row.machineEventSignalId);
    if (!machineEventSignalId) {
        return null;
    }

    const displayRowsRaw = row.event_display_rows ?? row.eventDisplayRows;
    const displayRows = Array.isArray(displayRowsRaw)
        ? displayRowsRaw
              .map((item) => mapDisplayRow(item as Record<string, unknown>))
              .filter((item): item is ReleaseProductionEventDisplayRow => item !== null)
        : [];

    return {
        machineEventSignalId,
        eventCode: pickString(row.event_code ?? row.eventCode) ?? "",
        eventCodeLabel: pickString(row.event_code_label ?? row.eventCodeLabel) ?? "",
        eventAt: pickString(row.event_at ?? row.eventAt) ?? "",
        informerDetail: pickString(row.informer_detail ?? row.informerDetail) ?? "",
        registerAction: pickString(row.register_action ?? row.registerAction) ?? "",
        displayRows,
    };
}

function mapListEventToCurrentEvent(row: Record<string, unknown>): ReleaseProductionCurrentEvent | null {
    const machineEventSignalId = pickString(row.signal_id ?? row.signalId);
    if (!machineEventSignalId) {
        return null;
    }

    const lengthM = pickNullableNumber(row.length_m ?? row.lengthM);

    return {
        machineEventSignalId,
        eventCode: pickString(row.event_name ?? row.eventName) ?? "",
        eventCodeLabel: pickString(row.event_description ?? row.eventDescription) ?? "",
        eventAt: pickString(row.registered_at ?? row.registeredAt) ?? "",
        informerDetail: "",
        registerAction: "",
        displayRows:
            lengthM != null
                ? [
                      {
                          characteristic: "Длина, м",
                          value: String(lengthM),
                          unit: "м",
                      },
                  ]
                : [],
    };
}

/** `current_event` в ответе бэка — массив (0..n); UI берёт первый элемент. */
function pickCurrentEventRow(raw: unknown): Record<string, unknown> | undefined {
    if (Array.isArray(raw)) {
        const first = raw[0];
        return first && typeof first === "object" ? (first as Record<string, unknown>) : undefined;
    }

    if (raw && typeof raw === "object") {
        return raw as Record<string, unknown>;
    }

    return undefined;
}

function isLegacyQueueSnapshot(row: Record<string, unknown>): boolean {
    return (
        "current_event" in row ||
        "currentEvent" in row ||
        "plate_title" in row ||
        "plateTitle" in row ||
        "pending_count" in row ||
        "pendingCount" in row
    );
}

function isEventListRow(row: Record<string, unknown>): boolean {
    return (
        "signal_id" in row ||
        "signalId" in row ||
        "registered_at" in row ||
        "registeredAt" in row
    );
}

function mapEventColumns(raw: unknown): ReleaseProductionEventColumn[] {
    if (!Array.isArray(raw) || raw.length === 0) {
        return RELEASE_PRODUCTION_EVENT_DEFAULT_COLUMNS;
    }

    const columns = raw
        .map((item) => {
            if (!item || typeof item !== "object") {
                return null;
            }

            const record = item as Record<string, unknown>;
            const key = pickString(record.name);
            const label = pickString(record.label);
            if (!key || !label) {
                return null;
            }

            return { key, label };
        })
        .filter((item): item is ReleaseProductionEventColumn => item !== null);

    return columns.length > 0 ? columns : RELEASE_PRODUCTION_EVENT_DEFAULT_COLUMNS;
}

function mapEventListRow(row: Record<string, unknown>, index: number): ReleaseProductionEventListRow | null {
    if (!isEventListRow(row)) {
        return null;
    }

    const id = pickString(row.signal_id ?? row.signalId) ?? `event-${index}`;
    const values: Record<string, string | number | null> = {};

    for (const [key, value] of Object.entries(row)) {
        if (value === null || value === undefined) {
            values[key] = null;
            continue;
        }

        if (typeof value === "number" && Number.isFinite(value)) {
            values[key] = value;
            continue;
        }

        values[key] = pickString(value) ?? String(value);
    }

    return { id, values };
}

function mapLegacyQueueSnapshot(resultItem: Record<string, unknown>): ReleaseProductionEventSnapshot {
    const pendingCount = pickNumber(resultItem.pending_count ?? resultItem.pendingCount) ?? 0;
    const currentEventRaw = resultItem.current_event ?? resultItem.currentEvent;

    return {
        workAreaId: pickString(resultItem.work_area_id ?? resultItem.workAreaId) ?? "",
        plateTitle: pickString(resultItem.plate_title ?? resultItem.plateTitle) ?? "Событие с машины",
        pendingCount,
        manualReleaseBlocked:
            pickBoolean(resultItem.manual_release_blocked ?? resultItem.manualReleaseBlocked) ??
            pendingCount > 0,
        emptyStateMessage:
            pickString(resultItem.empty_state_message ?? resultItem.emptyStateMessage) ?? "",
        currentEvent: mapCurrentEvent(pickCurrentEventRow(currentEventRaw)),
        eventList: [],
        eventColumns: RELEASE_PRODUCTION_EVENT_DEFAULT_COLUMNS,
    };
}

function mapEventListSnapshot(
    wrapper: Record<string, unknown>,
    resultRows: Record<string, unknown>[],
): ReleaseProductionEventSnapshot {
    const eventList = resultRows
        .map((row, index) => mapEventListRow(row, index))
        .filter((row): row is ReleaseProductionEventListRow => row !== null);
    const eventColumns = mapEventColumns(wrapper.result_field_labels ?? wrapper.resultFieldLabels);
    const pendingCount = eventList.length;
    const firstEventRow = resultRows.find(isEventListRow);

    return {
        workAreaId: "",
        plateTitle: "Событие с машины",
        pendingCount,
        manualReleaseBlocked: false,
        emptyStateMessage: pendingCount === 0 ? "Событий с машины нет" : "",
        currentEvent: firstEventRow ? mapListEventToCurrentEvent(firstEventRow) : null,
        eventList,
        eventColumns,
    };
}

export function mapEventReleaseProductionPayload(
    payload: ApiSchemas["OrderExecutionReleaseProductionEventResponse"] | undefined,
): ReleaseProductionEventSnapshot {
    const fallbackMessage = "Не удалось загрузить события выпуска с машины";
    const wrapper = payload?.[0] as Record<string, unknown> | undefined;
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultRaw = wrapper?.result;
    if (!Array.isArray(resultRaw) || resultRaw.length === 0) {
        return RELEASE_EMPTY_PRODUCTION_EVENT;
    }

    const resultRows = resultRaw.filter(
        (item): item is Record<string, unknown> => Boolean(item) && typeof item === "object",
    );

    const firstRow = resultRows[0];
    if (!firstRow) {
        return RELEASE_EMPTY_PRODUCTION_EVENT;
    }

    if (isLegacyQueueSnapshot(firstRow)) {
        return mapLegacyQueueSnapshot(firstRow);
    }

    if (!wrapper) {
        return RELEASE_EMPTY_PRODUCTION_EVENT;
    }

    return mapEventListSnapshot(wrapper, resultRows);
}

export function formatReleaseProductionEventCellValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }

    return String(value);
}

export function getReleaseProductionEventCellValue(
    row: ReleaseProductionEventListRow,
    columnKey: string,
): string | number | null {
    if (columnKey in row.values) {
        return row.values[columnKey] ?? null;
    }

    const camelKey = columnKey.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
    if (camelKey in row.values) {
        return row.values[camelKey] ?? null;
    }

    return null;
}
