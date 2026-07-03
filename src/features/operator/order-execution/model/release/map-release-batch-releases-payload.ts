import type { ApiSchemas } from "@/shared/api/schema";

import {
    assertReleaseRpcOk,
    formatReleaseUomLabel,
    pickBoolean,
    pickNullableNumber,
    pickNumber,
    pickString,
} from "./map-release-rpc-utils";
import type { ReleaseBatchRow } from "./types";

export type ReleaseBatchSnapshot = {
    workAreaId: string;
    rows: ReleaseBatchRow[];
    asOf: string | null;
    releaseCountOnWorkArea: number | null;
};

export const RELEASE_EMPTY_BATCH_SNAPSHOT: ReleaseBatchSnapshot = {
    workAreaId: "",
    rows: [],
    asOf: null,
    releaseCountOnWorkArea: null,
};

function mapBatchRow(row: Record<string, unknown>, index: number): ReleaseBatchRow | null {
    const barcode = pickString(row.barcode);
    if (!barcode) {
        return null;
    }

    const materialProductionReleaseId = pickString(
        row.material_production_release_id ?? row.materialProductionReleaseId,
    );
    const materialRollId = pickString(row.material_roll_id ?? row.materialRollId);

    return {
        id: materialProductionReleaseId ?? materialRollId ?? `${barcode}-${index}`,
        barcode,
        externalSeriesKey: pickString(row.external_series_key ?? row.externalSeriesKey) ?? "",
        materialRollId: materialRollId ?? "",
        materialProductionReleaseId: materialProductionReleaseId ?? "",
        rollTraceContextId: pickString(row.roll_trace_context_id ?? row.rollTraceContextId) ?? "",
        nomenclature: pickString(row.nomenclature_name ?? row.nomenclatureName) ?? "—",
        nomenclatureCode: pickString(row.nomenclature_code ?? row.nomenclatureCode) ?? "",
        qty1: pickNumber(row.quantity_primary ?? row.quantityPrimary),
        unit1: formatReleaseUomLabel(pickString(row.uom_primary ?? row.uomPrimary)),
        qty2: pickNumber(row.quantity_secondary ?? row.quantitySecondary),
        unit2: formatReleaseUomLabel(pickString(row.uom_secondary ?? row.uomSecondary)),
        rollStatus: pickString(row.roll_status ?? row.rollStatus) ?? "",
        rollStatusLabel: pickString(row.roll_status_label ?? row.rollStatusLabel) ?? "",
        blocked: pickBoolean(row.blocked),
        blockReasonCode: pickString(row.block_reason_code ?? row.blockReasonCode) ?? "",
        statusLabel: pickString(row.status_label ?? row.statusLabel) ?? "",
    };
}

export function mapReleaseBatchReleasesPayload(
    payload: ApiSchemas["OrderExecutionReleaseBatchReleasesResponse"] | undefined,
): ReleaseBatchSnapshot {
    const fallbackMessage = "Не удалось загрузить выпуски партии";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    const batchRows = Array.isArray(resultItem?.batch_rows)
        ? resultItem.batch_rows
        : Array.isArray(resultItem?.batchRows)
          ? resultItem.batchRows
          : [];

    return {
        workAreaId: pickString(resultItem?.work_area_id ?? resultItem?.workAreaId) ?? "",
        rows: batchRows
            .map((row, index) => mapBatchRow(row as Record<string, unknown>, index))
            .filter((row): row is ReleaseBatchRow => row !== null),
        asOf: pickString(resultItem?.as_of ?? resultItem?.asOf) ?? null,
        releaseCountOnWorkArea: pickNullableNumber(
            resultItem?.release_count_on_work_area ?? resultItem?.releaseCountOnWorkArea,
        ),
    };
}
