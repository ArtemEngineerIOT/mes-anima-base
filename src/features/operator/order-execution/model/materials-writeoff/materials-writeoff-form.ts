export const MATERIALS_WRITEOFF_WAREHOUSE_OPTIONS = ["100", "200"];

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

export function isMaterialFullWriteoffReady(form: MaterialsWriteoffFormState): boolean {
    return form.warehouse.trim() !== "";
}

export function canCalculateWriteoffWeight(length: string): boolean {
    return parseWriteoffLength(length) !== null;
}
