import type { MaterialsPresenceRow } from "./types";

export type MaterialsInstallationPlace = "WAITING" | "ON_UNWIND";

export type MaterialsInstallationPlaceOption = {
    value: MaterialsInstallationPlace;
    label: string;
    disabled?: boolean;
};

export const MATERIALS_INSTALLATION_PLACE_OPTIONS: ReadonlyArray<MaterialsInstallationPlaceOption> = [
    { value: "WAITING", label: "Ожидание" },
    { value: "ON_UNWIND", label: "Размотка" },
];

export const DEFAULT_MATERIALS_INSTALLATION_PLACE: MaterialsInstallationPlace = "WAITING";

export function resolveInstallationPlaceOptions(
    rows: MaterialsPresenceRow[],
): ReadonlyArray<MaterialsInstallationPlaceOption> {
    const unwindOccupied = rows.some((row) => row.status === "ON_UNWIND");

    return MATERIALS_INSTALLATION_PLACE_OPTIONS.map((option) => ({
        ...option,
        disabled: unwindOccupied && option.value === "ON_UNWIND",
    }));
}

export type MaterialsWriteoffFormState = {
    meters: string;
    weight: string;
    warehouse: string;
};

export const EMPTY_MATERIALS_WRITEOFF_FORM: MaterialsWriteoffFormState = {
    meters: "",
    weight: "",
    warehouse: "",
};

export function sanitizeWriteoffMetersInput(value: string): string {
    const cleaned = value.replace(/[^\d.,]/g, "");
    const match = cleaned.match(/^\d*(?:[.,]\d*)?/);
    return match?.[0] ?? "";
}

export function parseWriteoffLength(value: string): number | null {
    const trimmed = value.trim().replace(",", ".");
    if (!trimmed) {
        return null;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

export function parseWriteoffWeight(value: string): number | null {
    const trimmed = value.trim().replace(",", ".");
    if (!trimmed) {
        return null;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

export function isMaterialsWriteoffFormReady(form: MaterialsWriteoffFormState): boolean {
    return (
        parseWriteoffLength(form.meters) !== null &&
        parseWriteoffWeight(form.weight) !== null &&
        form.warehouse.trim() !== ""
    );
}

export function canCalculateWriteoffWeight(length: string, barcode?: string | null): boolean {
    return Boolean(barcode?.trim()) && parseWriteoffLength(length) !== null;
}
