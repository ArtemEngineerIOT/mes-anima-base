import type { ApiSchemas } from "@/shared/api/schema";

import type { MaterialsPresenceRow, MaterialsPresenceStatus, MaterialsRollPresenceSnapshot } from "./types";

const OK_ERROR_CODE = "OK";

const EMPTY_SNAPSHOT: MaterialsRollPresenceSnapshot = {
    rows: [],
    asOf: null,
    workAreaId: null,
};

type SlotGroupContext = {
    nomenclatureName: string;
    nomenclatureCode: string;
};

function pickString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function pickNumber(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value.replace(",", "."));
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return 0;
}

function pickBoolean(value: unknown): boolean | null {
    if (typeof value === "boolean") {
        return value;
    }

    if (value === "true") return true;
    if (value === "false") return false;

    return null;
}

function pickNullableString(value: unknown): string | null {
    const trimmed = pickString(value);
    return trimmed || null;
}

function mapPresenceStatus(value: unknown, fallback: MaterialsPresenceStatus): MaterialsPresenceStatus {
    const normalized = pickString(value).toUpperCase();
    if (normalized === "ON_UNWIND" || normalized === "UNWIND") {
        return "ON_UNWIND";
    }

    if (normalized === "WAITING") {
        return "WAITING";
    }

    return fallback;
}

function readPresenceRows(value: unknown): Record<string, unknown>[] {
    if (Array.isArray(value)) {
        return value.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object");
    }

    if (value && typeof value === "object") {
        return [value as Record<string, unknown>];
    }

    return [];
}

function mapPresenceSlotRow(
    row: Record<string, unknown>,
    group: SlotGroupContext,
    fallbackStatus: MaterialsPresenceStatus,
): MaterialsPresenceRow | null {
    const presenceId = pickString(row.presence_id ?? row.presenceId);
    const materialRollId = pickString(row.material_roll_id ?? row.materialRollId);
    const barcode = pickString(row.barcode) || materialRollId;
    const id = presenceId || materialRollId || barcode;

    if (!id) {
        return null;
    }

    const status = mapPresenceStatus(row.presence_status ?? row.presenceStatus, fallbackStatus);
    const canMoveToUnwind = pickBoolean(row.can_move_to_unwind ?? row.canMoveToUnwind);
    const writeOffAllowed = pickBoolean(row.write_off_allowed ?? row.writeOffAllowed);

    return {
        id,
        materialRollId: materialRollId || id,
        barcode,
        nomenclatureName: group.nomenclatureName || barcode,
        nomenclatureCode: group.nomenclatureCode,
        scannedAt: pickString(row.scanned_at ?? row.scannedAt) || "—",
        status,
        quantityUom: pickString(row.quantity_uom ?? row.quantityUom) || "MTR",
        currentLengthM: pickNumber(row.current_length_m ?? row.currentLengthM),
        currentWeightKg: pickNumber(row.current_weight_kg ?? row.currentWeightKg),
        canMoveToUnwind: canMoveToUnwind ?? status === "WAITING",
        writeOffAllowed: writeOffAllowed ?? status === "ON_UNWIND",
    };
}

function mapSlotGroup(group: Record<string, unknown>): MaterialsPresenceRow[] {
    const context: SlotGroupContext = {
        nomenclatureName: pickString(group.nomenclature_name ?? group.nomenclatureName),
        nomenclatureCode: pickString(group.nomenclature_code ?? group.nomenclatureCode),
    };

    const waitingRows = readPresenceRows(group.waiting_rows ?? group.waitingRows).flatMap((row) => {
        const mapped = mapPresenceSlotRow(row, context, "WAITING");
        return mapped ? [mapped] : [];
    });

    const unwindRows = readPresenceRows(group.unwind_row ?? group.unwindRow).flatMap((row) => {
        const mapped = mapPresenceSlotRow(row, context, "ON_UNWIND");
        return mapped ? [mapped] : [];
    });

    return [...waitingRows, ...unwindRows];
}

function mapPresenceSnapshot(snapshot: Record<string, unknown>): MaterialsPresenceRow[] {
    const slotGroups = snapshot.slot_groups ?? snapshot.slotGroups;
    if (!Array.isArray(slotGroups)) {
        return [];
    }

    return slotGroups.flatMap((group) =>
        group && typeof group === "object" ? mapSlotGroup(group as Record<string, unknown>) : [],
    );
}

export function mapStageRollPresencePayload(
    payload: ApiSchemas["OrderExecutionStageRollPresenceResponse"] | undefined,
): MaterialsRollPresenceSnapshot {
    const fallbackMessage = "Не удалось загрузить рулоны в машине";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    const wrapperRecord = wrapper as Record<string, unknown>;
    const result = wrapper.result;
    if (!Array.isArray(result)) {
        return EMPTY_SNAPSHOT;
    }

    const snapshots = result.filter(
        (snapshot): snapshot is Record<string, unknown> => Boolean(snapshot) && typeof snapshot === "object",
    );
    const firstSnapshot = snapshots[0];

    return {
        rows: snapshots.flatMap((snapshot) => mapPresenceSnapshot(snapshot)),
        asOf:
            pickNullableString(firstSnapshot?.as_of ?? firstSnapshot?.asOf) ??
            pickNullableString(wrapperRecord.as_of ?? wrapperRecord.asOf),
        workAreaId:
            pickNullableString(firstSnapshot?.work_area_id ?? firstSnapshot?.workAreaId) ??
            pickNullableString(wrapperRecord.work_area_id ?? wrapperRecord.workAreaId),
    };
}

export { EMPTY_SNAPSHOT as MATERIALS_ROLL_PRESENCE_EMPTY_SNAPSHOT };
