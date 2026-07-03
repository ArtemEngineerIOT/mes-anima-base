import type { ApiSchemas } from "@/shared/api/schema";
import { assertReleaseRpcOk, pickBoolean, pickNumber, pickRawString, pickString } from "../release/map-release-rpc-utils";
import type { MaterialsWriteoffData } from "./types";

export type ActiveInputPrefillRoll = {
    materialRollId: string;
    rollTraceContextId: string;
    seriesKey: string;
    nomenclatureCode: string;
    nomenclatureName: string;
    currentLengthM: number;
};

export type ActiveInputPrefillSnapshot = {
    workAreaId: string;
    hasActiveInputRoll: boolean;
    shouldPrefillScan: boolean;
    activeInputRoll: ActiveInputPrefillRoll | null;
};

export const EMPTY_ACTIVE_INPUT_PREFILL: ActiveInputPrefillSnapshot = {
    workAreaId: "",
    hasActiveInputRoll: false,
    shouldPrefillScan: false,
    activeInputRoll: null,
};

function readTableRows(value: unknown): unknown[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
        const obj = value as Record<string, unknown>;
        if (Array.isArray(obj.records)) {
            return obj.records;
        }
        if (Array.isArray(obj.table)) {
            return obj.table;
        }
    }

    return [];
}

function mapActiveInputRollRow(row: Record<string, unknown>): ActiveInputPrefillRoll | null {
    const seriesKey = pickRawString(row.series_key ?? row.seriesKey);
    if (!seriesKey) {
        return null;
    }

    return {
        materialRollId: pickString(row.material_roll_id ?? row.materialRollId) ?? "",
        rollTraceContextId: pickString(row.roll_trace_context_id ?? row.rollTraceContextId) ?? "",
        seriesKey,
        nomenclatureCode: pickString(row.nomenclature_code ?? row.nomenclatureCode) ?? "—",
        nomenclatureName: pickString(row.nomenclature_name ?? row.nomenclatureName) ?? "—",
        currentLengthM: pickNumber(row.current_length_m ?? row.currentLengthM),
    };
}

export function mapActiveInputPrefillPayload(
    payload: ApiSchemas["OrderExecutionActiveInputPrefillResponse"] | undefined,
): ActiveInputPrefillSnapshot {
    const fallbackMessage = "Не удалось загрузить предзаполнение поля скана";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    if (!resultItem) {
        return EMPTY_ACTIVE_INPUT_PREFILL;
    }

    const activeInputRows = readTableRows(resultItem.active_input_rolls ?? resultItem.activeInputRolls);
    const activeInputRoll = activeInputRows
        .map((row) => mapActiveInputRollRow(row as Record<string, unknown>))
        .find((row): row is ActiveInputPrefillRoll => row !== null);

    const hasActiveInputRoll = pickBoolean(resultItem.has_active_input_roll ?? resultItem.hasActiveInputRoll);
    const shouldPrefillScan = pickBoolean(resultItem.should_prefill_scan ?? resultItem.shouldPrefillScan);

    return {
        workAreaId: pickString(resultItem.work_area_id ?? resultItem.workAreaId) ?? "",
        hasActiveInputRoll,
        shouldPrefillScan,
        activeInputRoll: activeInputRoll ?? null,
    };
}

/** Черновик «Данные по серии» из prefill до resolve (SCR-04). */
export function buildPrefillSeriesDraft(roll: ActiveInputPrefillRoll): MaterialsWriteoffData {
    return {
        stageSpecStatus: "MATCHED",
        stageSpecBannerVisible: false,
        stageSpecBannerTitle: "",
        stageSpecBannerDetail: "",
        alreadyRegisteredOnStage: true,
        materialRollId: roll.materialRollId,
        rollTraceContextId: roll.rollTraceContextId,
        stageRegistryRefreshHint: false,
        seriesCard: {
            nomenclatureName: roll.nomenclatureName,
            nomenclatureCode: roll.nomenclatureCode,
            seriesRef: roll.seriesKey,
            externalSeriesKey: roll.seriesKey,
            quantityUom: "MTR",
            currentLengthM: roll.currentLengthM,
            currentWeightKg: 0,
            isSemiFinished: false,
        },
        writeoffDefaults: null,
    };
}
