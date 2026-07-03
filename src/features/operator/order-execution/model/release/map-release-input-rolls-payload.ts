import type { ApiSchemas } from "@/shared/api/schema";

import {
    assertReleaseTraceabilityOk,
    formatReleaseUomLabel,
    pickNumber,
    pickRawString,
    pickString,
} from "./map-release-rpc-utils";
import type { ReleaseInputRollRow } from "./types";

function readInputRolls(wrapper: Record<string, unknown>): unknown[] {
    if (Array.isArray(wrapper.input_rolls)) {
        return wrapper.input_rolls;
    }
    if (Array.isArray(wrapper.inputRolls)) {
        return wrapper.inputRolls;
    }

    const resultItem = Array.isArray(wrapper.result) ? (wrapper.result[0] as Record<string, unknown>) : undefined;
    if (Array.isArray(resultItem?.input_rolls)) {
        return resultItem.input_rolls;
    }
    if (Array.isArray(resultItem?.inputRolls)) {
        return resultItem.inputRolls;
    }

    return [];
}

function mapInputRollRow(row: Record<string, unknown>, index: number): ReleaseInputRollRow | null {
    const barcode = pickRawString(row.barcode);
    if (!barcode) {
        return null;
    }

    const externalSeriesKey = pickRawString(row.external_series_key ?? row.externalSeriesKey) ?? "";
    const stageInputCardStatus = pickString(row.stage_input_card_status ?? row.stageInputCardStatus) ?? "";
    const materialRollId = pickString(row.material_roll_id ?? row.materialRollId);

    return {
        id: materialRollId ?? `${barcode}-${index}`,
        barcode,
        externalSeriesKey,
        materialRollId: materialRollId ?? "",
        rollTraceContextId: pickString(row.roll_trace_context_id ?? row.rollTraceContextId) ?? "",
        meterCardId: pickString(row.meter_card_id ?? row.meterCardId) ?? "",
        nomenclature: pickRawString(row.nomenclature_name ?? row.nomenclatureName) ?? "—",
        nomenclatureCode: pickString(row.nomenclature_code ?? row.nomenclatureCode) ?? "",
        qty1: pickNumber(row.quantity_primary ?? row.quantityPrimary),
        unit1: formatReleaseUomLabel(pickString(row.uom_primary ?? row.uomPrimary)),
        qty2: pickNumber(row.quantity_secondary ?? row.quantitySecondary),
        unit2: formatReleaseUomLabel(pickString(row.uom_secondary ?? row.uomSecondary)),
        stageInputCardStatus,
        rollStatus: pickString(row.roll_status ?? row.rollStatus) ?? "",
        rollStatusLabel: pickString(row.roll_status_label ?? row.rollStatusLabel) ?? "",
        blockSelectable: Boolean(externalSeriesKey) && stageInputCardStatus === "ACTIVE",
    };
}

export type ReleaseInputRollsSnapshot = {
    workAreaId: string;
    rows: ReleaseInputRollRow[];
};

export const RELEASE_EMPTY_INPUT_ROLLS_SNAPSHOT: ReleaseInputRollsSnapshot = {
    workAreaId: "",
    rows: [],
};

export function mapReleaseInputRollsPayload(
    payload: ApiSchemas["OrderExecutionReleaseInputRollsResponse"] | undefined,
): ReleaseInputRollsSnapshot {
    const fallbackMessage = "Не удалось загрузить входные рулоны";
    const wrapper = payload?.[0] as Record<string, unknown> | undefined;
    assertReleaseTraceabilityOk(wrapper, fallbackMessage);

    const inputRolls = readInputRolls(wrapper ?? {});

    return {
        workAreaId: pickString(wrapper?.work_area_id ?? wrapper?.workAreaId) ?? "",
        rows: inputRolls
            .map((row, index) => mapInputRollRow(row as Record<string, unknown>, index))
            .filter((row): row is ReleaseInputRollRow => row !== null),
    };
}
