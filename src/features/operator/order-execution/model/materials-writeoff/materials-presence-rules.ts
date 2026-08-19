import type { MaterialsInstallationPlace } from "./materials-writeoff-form";
import type { MaterialsPresenceRow, MaterialsPresenceSlot } from "./types";

export function hasUnwindingRollInSlot(rows: MaterialsPresenceRow[], unwindNo: string): boolean {
    return rows.some((row) => row.unwindNo === unwindNo && row.status === "ON_UNWIND");
}

export function hasUnwindingRollForNomenclature(
    rows: MaterialsPresenceRow[],
    nomenclatureCode: string,
): boolean {
    return rows.some((row) => row.nomenclatureCode === nomenclatureCode && row.status === "ON_UNWIND");
}

export function hasFreeUnwindSlot(slots: MaterialsPresenceSlot[]): boolean {
    return slots.some((slot) => !slot.rows.some((row) => row.status === "ON_UNWIND"));
}

export function hasAnyUnwindingRoll(rows: MaterialsPresenceRow[]): boolean {
    return rows.some((row) => row.status === "ON_UNWIND");
}

export function resolveDefaultInstallationPlace(slots: MaterialsPresenceSlot[]): MaterialsInstallationPlace {
    return hasFreeUnwindSlot(slots) ? "ON_UNWIND" : "WAITING";
}

export function canInstallAtUnwind(
    rows: MaterialsPresenceRow[],
    unwindNo: string,
    place: MaterialsInstallationPlace,
): boolean {
    if (place !== "ON_UNWIND") {
        return true;
    }

    return !hasUnwindingRollInSlot(rows, unwindNo);
}

export function upsertPresenceRow(rows: MaterialsPresenceRow[], nextRow: MaterialsPresenceRow): MaterialsPresenceRow[] {
    const withoutDuplicate = rows.filter((row) => row.id !== nextRow.id);
    return [...withoutDuplicate, nextRow];
}

export function movePresenceRowToUnwind(rows: MaterialsPresenceRow[], rowId: string): MaterialsPresenceRow[] {
    const target = rows.find((row) => row.id === rowId);
    if (!target || !target.canMoveToUnwind || target.status !== "WAITING") {
        return rows;
    }

    if (hasUnwindingRollInSlot(rows, target.unwindNo)) {
        return rows;
    }

    return rows.map((row) => {
        if (row.id !== rowId) {
            return row;
        }

        return {
            ...row,
            status: "ON_UNWIND",
            canMoveToUnwind: false,
            writeOffAllowed: true,
        };
    });
}

export function removePresenceRow(rows: MaterialsPresenceRow[], rowId: string): MaterialsPresenceRow[] {
    return rows.filter((row) => row.id !== rowId);
}
