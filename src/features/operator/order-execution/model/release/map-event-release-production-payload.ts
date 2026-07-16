import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickBoolean, pickNumber, pickString } from "./map-release-rpc-utils";
import {
    RELEASE_EMPTY_PRODUCTION_EVENT,
    type ReleaseProductionCurrentEvent,
    type ReleaseProductionEventDisplayRow,
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

export function mapEventReleaseProductionPayload(
    payload: ApiSchemas["OrderExecutionReleaseProductionEventResponse"] | undefined,
): ReleaseProductionEventSnapshot {
    const fallbackMessage = "Не удалось загрузить события выпуска с машины";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    if (!resultItem) {
        return RELEASE_EMPTY_PRODUCTION_EVENT;
    }

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
    };
}
