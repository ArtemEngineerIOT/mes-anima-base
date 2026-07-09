import type { MaterialsInstallationPlace } from "./materials-writeoff-form";
import type { MaterialsPresenceRow } from "./types";

export function hasUnwindingRollForNomenclature(
    rows: MaterialsPresenceRow[],
    nomenclatureCode: string,
): boolean {
    return rows.some((row) => row.nomenclatureCode === nomenclatureCode && row.status === "ON_UNWIND");
}

export function hasAnyUnwindingRoll(rows: MaterialsPresenceRow[]): boolean {
    return rows.some((row) => row.status === "ON_UNWIND");
}

export function resolveDefaultInstallationPlace(rows: MaterialsPresenceRow[]): MaterialsInstallationPlace {
    return hasAnyUnwindingRoll(rows) ? "WAITING" : "ON_UNWIND";
}

export function canInstallAtUnwind(
    rows: MaterialsPresenceRow[],
    nomenclatureCode: string,
    place: MaterialsInstallationPlace,
): boolean {
    if (place !== "ON_UNWIND") {
        return true;
    }

    return !hasUnwindingRollForNomenclature(rows, nomenclatureCode);
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

    if (hasUnwindingRollForNomenclature(rows, target.nomenclatureCode)) {
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
