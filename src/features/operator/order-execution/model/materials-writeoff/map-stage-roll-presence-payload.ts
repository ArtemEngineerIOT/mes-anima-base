import type { ApiSchemas } from "@/shared/api/schema";

import type {
    MaterialsPresenceDeliveryKind,
    MaterialsPresenceRow,
    MaterialsPresenceSlot,
    MaterialsPresenceStatus,
    MaterialsRollPresenceSnapshot,
} from "./types";

const OK_ERROR_CODE = "OK";

const EMPTY_SNAPSHOT: MaterialsRollPresenceSnapshot = {
    slots: [],
    rows: [],
    asOf: null,
    workAreaId: null,
};

type SlotGroupContext = {
    unwindNo: string;
    unwindLabel: string;
    deliveryKind: MaterialsPresenceDeliveryKind;
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

function mapDeliveryKind(value: unknown): MaterialsPresenceDeliveryKind {
    const normalized = pickString(value).toUpperCase();
    if (normalized === "RAW_MATERIAL" || normalized === "SEMI_FINISHED") {
        return normalized;
    }

    return "";
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

function compareUnwindNo(left: string, right: string): number {
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftNumber !== rightNumber) {
        return leftNumber - rightNumber;
    }

    return left.localeCompare(right, "ru");
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
        unwindNo: group.unwindNo,
        unwindLabel: group.unwindLabel,
        deliveryKind: group.deliveryKind,
    };
}

function mapSlotGroup(group: Record<string, unknown>, index: number): MaterialsPresenceSlot {
    const unwindNo = pickString(group.unwind_no ?? group.unwindNo) || String(index + 1);
    const unwindLabel =
        pickString(group.unwind_label ?? group.unwindLabel) || `Размотка ${unwindNo}`;
    const context: SlotGroupContext = {
        unwindNo,
        unwindLabel,
        deliveryKind: mapDeliveryKind(group.delivery_kind ?? group.deliveryKind),
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

    return {
        id: unwindNo,
        unwindNo,
        unwindLabel,
        deliveryKind: context.deliveryKind,
        nomenclatureName: context.nomenclatureName,
        nomenclatureCode: context.nomenclatureCode,
        rows: [...waitingRows, ...unwindRows],
    };
}

function mapPresenceSlots(snapshot: Record<string, unknown>): MaterialsPresenceSlot[] {
    const slotGroups = snapshot.slot_groups ?? snapshot.slotGroups;
    if (!Array.isArray(slotGroups)) {
        return [];
    }

    return slotGroups
        .flatMap((group, index) =>
            group && typeof group === "object" ? [mapSlotGroup(group as Record<string, unknown>, index)] : [],
        )
        .sort((left, right) => compareUnwindNo(left.unwindNo, right.unwindNo));
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
    const slots = snapshots.flatMap((snapshot) => mapPresenceSlots(snapshot));

    return {
        slots,
        rows: slots.flatMap((slot) => slot.rows),
        asOf:
            pickNullableString(firstSnapshot?.as_of ?? firstSnapshot?.asOf) ??
            pickNullableString(wrapperRecord.as_of ?? wrapperRecord.asOf),
        workAreaId:
            pickNullableString(firstSnapshot?.work_area_id ?? firstSnapshot?.workAreaId) ??
            pickNullableString(wrapperRecord.work_area_id ?? wrapperRecord.workAreaId),
    };
}

export { EMPTY_SNAPSHOT as MATERIALS_ROLL_PRESENCE_EMPTY_SNAPSHOT };
