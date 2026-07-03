import type { MaterialsStageOperation, MaterialsStageOperationDetail } from "./types";

function pickString(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    return undefined;
}

function pickNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return undefined;
}

function formatUom(value: unknown): string {
    const code = pickString(value)?.toUpperCase();
    if (!code) {
        return "—";
    }

    if (code === "KGM") {
        return "кг";
    }
    if (code === "MTR") {
        return "м";
    }

    return code;
}

function mapOperationLine(row: Record<string, unknown>): MaterialsStageOperationDetail | null {
    const label = pickString(row.operation_kind_label ?? row.operationKindLabel);
    if (!label) {
        return null;
    }

    return {
        label,
        qty1: pickNumber(row.quantity_primary ?? row.quantityPrimary) ?? 0,
        unit1: formatUom(row.uom_primary ?? row.uomPrimary),
        qty2: pickNumber(row.quantity_secondary ?? row.quantitySecondary) ?? 0,
        unit2: formatUom(row.uom_secondary ?? row.uomSecondary),
        operationKind: pickString(row.operation_kind ?? row.operationKind),
    };
}

export function mapMaterialsStageOperation(row: Record<string, unknown>, index: number): MaterialsStageOperation | null {
    const barcode = pickString(row.barcode);
    const nomenclature = pickString(row.nomenclature_name ?? row.nomenclatureName ?? row.nomenclature);
    if (!barcode && !nomenclature) {
        return null;
    }

    const operationLines = row.operation_lines ?? row.operationLines;
    const details = Array.isArray(operationLines)
        ? operationLines
              .map((item) => mapOperationLine(item as Record<string, unknown>))
              .filter((item): item is MaterialsStageOperationDetail => item !== null)
        : undefined;

    const materialRollId = pickString(row.material_roll_id ?? row.materialRollId ?? row.id) ?? String(index + 1);

    return {
        id: materialRollId,
        materialRollId,
        barcode: barcode ?? "—",
        nomenclature: nomenclature ?? "—",
        qty1: pickNumber(row.quantity_primary ?? row.quantityPrimary ?? row.qty1) ?? 0,
        unit1: formatUom(row.uom_primary ?? row.uomPrimary ?? row.unit1),
        qty2: pickNumber(row.quantity_secondary ?? row.quantitySecondary ?? row.qty2) ?? 0,
        unit2: formatUom(row.uom_secondary ?? row.uomSecondary ?? row.unit2),
        rollStatus: pickString(row.roll_status ?? row.rollStatus),
        rollStatusLabel: pickString(row.roll_status_label ?? row.rollStatusLabel),
        stageInputCardStatus: pickString(row.stage_input_card_status ?? row.stageInputCardStatus),
        details: details && details.length > 0 ? details : undefined,
    };
}

export function mapMaterialsStageOperations(rows: unknown): MaterialsStageOperation[] {
    if (!Array.isArray(rows)) {
        return [];
    }

    return rows
        .map((row, index) => mapMaterialsStageOperation(row as Record<string, unknown>, index))
        .filter((row): row is MaterialsStageOperation => row !== null);
}
