import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickNumber, pickString } from "../../release/map-release-rpc-utils";
import type { TechnologicalParamHistoryEntry } from "../../technological-params-history";
import type { TechnologicalParamsSections } from "../../technological-params-mock";
import {
    buildProcessParamsParamCodeBindings,
    isSetProcessParamCode,
    type LastProcessParamsSlicesSnapshot,
    type ProcessParamsSliceRow,
} from "./types";

function readResultRows(payload: ApiSchemas["OrderExecutionLastProcessParamsSlicesResponse"] | undefined): Record<
    string,
    unknown
>[] {
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, "Не удалось загрузить срезы технологических параметров");

    const result = wrapper?.result;
    if (!Array.isArray(result)) {
        return [];
    }

    return result.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
}

function mapSliceRow(row: Record<string, unknown>): ProcessParamsSliceRow | null {
    const paramCode = pickString(row.param_code ?? row.paramCode);
    if (!paramCode || isSetProcessParamCode(paramCode)) {
        return null;
    }

    const sliceNo = pickNumber(row.slice_no ?? row.sliceNo);
    return {
        sliceNo,
        externalSeriesKey:
            pickString(row.external_series_key ?? row.externalSeriesKey) ??
            pickString(row.material_roll_id ?? row.materialRollId) ??
            "—",
        paramCode,
        value: pickString(row.value) ?? "",
        updatedAt: pickString(row.updated_at ?? row.updatedAt) ?? "",
    };
}

function joinCompositeParts(parts: Array<string | undefined>): string {
    const values = parts.map((part) => (part ?? "").trim()).filter(Boolean);
    if (values.length === 0) {
        return "";
    }
    return values.join("-");
}

/**
 * Группирует строки BFF по `slice_no` (старый → новый) и раскладывает ACT-значения по id строк UI.
 * В заголовке колонки — `updated_at` среза.
 */
export function mapLastProcessParamsSlicesPayload(
    payload: ApiSchemas["OrderExecutionLastProcessParamsSlicesResponse"] | undefined,
    sections: TechnologicalParamsSections,
): LastProcessParamsSlicesSnapshot {
    const bindings = buildProcessParamsParamCodeBindings(sections);
    const sliceRows = readResultRows(payload)
        .map(mapSliceRow)
        .filter((row): row is ProcessParamsSliceRow => row !== null);

    const sliceNos = [...new Set(sliceRows.map((row) => row.sliceNo))].sort((a, b) => a - b);
    const historyByRowId: Record<string, TechnologicalParamHistoryEntry[]> = {};

    for (const sliceNo of sliceNos) {
        const rowsInSlice = sliceRows.filter((row) => row.sliceNo === sliceNo);
        const rollNumber = rowsInSlice[0]?.externalSeriesKey || "—";
        const checkedAt = rowsInSlice[0]?.updatedAt || "";

        const partsByRowId = new Map<string, Array<string | undefined>>();

        for (const row of rowsInSlice) {
            const binding = bindings.get(row.paramCode);
            if (!binding) {
                continue;
            }

            const parts = partsByRowId.get(binding.rowId) ?? [];
            parts[binding.partIndex] = row.value;
            partsByRowId.set(binding.rowId, parts);
        }

        for (const [rowId, parts] of partsByRowId) {
            const value = joinCompositeParts(parts);
            if (!value) {
                continue;
            }

            const entry: TechnologicalParamHistoryEntry = {
                rollNumber,
                checkedAt,
                value,
            };
            historyByRowId[rowId] = [...(historyByRowId[rowId] ?? []), entry];
        }
    }

    return { historyByRowId };
}
