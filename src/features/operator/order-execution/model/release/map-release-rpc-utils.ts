import type { ReleaseWarehouseOption } from "./types";

const OK_ERROR_CODE = "OK";

export function assertReleaseRpcOk(
    wrapper: { error_code?: string; error_message?: string | null } | undefined,
    fallbackMessage: string,
): void {
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }
}

/** Домен traceability: успех при `error_code` = `OK` или пустой строке. */
export function assertReleaseTraceabilityOk(
    wrapper: { error_code?: string; error_message?: string | null } | undefined,
    fallbackMessage: string,
): void {
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode === OK_ERROR_CODE || errorCode === "") {
        return;
    }

    throw new Error(wrapper.error_message?.trim() || fallbackMessage);
}

export function pickString(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    return undefined;
}

/** Сохраняет пробелы внутри строки (штрихкод / серия). */
export function pickRawString(value: unknown): string | undefined {
    if (typeof value === "string" && value.length > 0) {
        return value;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    return undefined;
}

export function pickNumber(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return 0;
}

export function pickBoolean(value: unknown): boolean {
    if (typeof value === "boolean") {
        return value;
    }
    if (value === 1 || value === "1" || value === "true" || value === "TRUE") {
        return true;
    }
    return false;
}

export function formatReleaseUomLabel(code: string | undefined): string {
    const normalized = (code ?? "").trim().toUpperCase();
    if (normalized === "KG" || normalized === "KGM") {
        return "кг";
    }
    if (normalized === "M" || normalized === "MTR") {
        return "пог. м";
    }
    return code?.trim() || "—";
}

export function pickNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return null;
}

export function mapReleaseWarehouseOption(row: Record<string, unknown>): ReleaseWarehouseOption | null {
    const warehouseCode = pickString(row.warehouse_code ?? row.warehouseCode);
    if (!warehouseCode) {
        return null;
    }

    return {
        warehouseCode,
        warehouseLabel: pickString(row.warehouse_label ?? row.warehouseLabel) ?? warehouseCode,
    };
}

export function formatWarehouseLabel(warehouse: Record<string, unknown>): string | undefined {
    const label = pickString(warehouse.warehouse_label ?? warehouse.warehouseLabel);
    if (label) {
        return label;
    }

    const code = pickString(warehouse.warehouse_code ?? warehouse.warehouseCode);
    return code;
}
