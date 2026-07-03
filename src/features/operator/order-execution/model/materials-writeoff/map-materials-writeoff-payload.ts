import type { ApiSchemas } from "@/shared/api/schema";

import type { MaterialsSeriesCard, MaterialsWriteoffData, MaterialsWriteoffDefaults } from "./types";

const OK_ERROR_CODE = "OK";

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

function pickBoolean(value: unknown): boolean {
    if (typeof value === "boolean") {
        return value;
    }
    if (value === 1 || value === "1" || value === "true" || value === "TRUE") {
        return true;
    }
    return false;
}

function mapSeriesCard(row: Record<string, unknown> | undefined): MaterialsSeriesCard | null {
    if (!row) {
        return null;
    }

    const nomenclatureName = pickString(row.nomenclature_name ?? row.nomenclatureName);
    const seriesRef = pickString(row.series_ref ?? row.seriesRef);
    if (!nomenclatureName && !seriesRef) {
        return null;
    }

    return {
        nomenclatureName: nomenclatureName ?? "—",
        nomenclatureCode: pickString(row.nomenclature_code ?? row.nomenclatureCode) ?? "—",
        seriesRef: seriesRef ?? "—",
        externalSeriesKey: pickString(row.external_series_key ?? row.externalSeriesKey) ?? "",
        quantityUom: pickString(row.quantity_uom ?? row.quantityUom) ?? "—",
        currentLengthM: pickNumber(row.current_length_m ?? row.currentLengthM) ?? 0,
        currentWeightKg: pickNumber(row.current_weight_kg ?? row.currentWeightKg) ?? 0,
        isSemiFinished: pickBoolean(row.is_semi_finished ?? row.isSemiFinished),
    };
}

function mapWriteoffDefaults(row: Record<string, unknown> | undefined): MaterialsWriteoffDefaults | null {
    if (!row) {
        return null;
    }

    const rawOptions = row.warehouse_options ?? row.warehouseOptions;
    const warehouseOptions = Array.isArray(rawOptions)
        ? rawOptions
              .map((item: unknown) => pickString(item))
              .filter((item): item is string => Boolean(item))
        : [];

    return {
        meters: pickString(row.meters) ?? "",
        weight: pickString(row.weight) ?? "",
        warehouse: pickString(row.warehouse) ?? warehouseOptions[0] ?? "",
        warehouseOptions,
    };
}

export function mapMaterialsWriteoffPayload(
    payload: ApiSchemas["OrderExecutionMaterialSeriesResponse"] | undefined,
): MaterialsWriteoffData {
    const fallbackMessage = "Не удалось загрузить данные по серии";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    const result = (wrapper.result?.[0] ?? undefined) as Record<string, unknown> | undefined;
    if (!result) {
        throw new Error(fallbackMessage);
    }

    const seriesCard = mapSeriesCard(
        Array.isArray(result.series_card)
            ? (result.series_card[0] as Record<string, unknown>)
            : (result.series_card as Record<string, unknown> | undefined),
    );

    const writeoffDefaults = mapWriteoffDefaults(
        Array.isArray(result.writeoff_defaults)
            ? (result.writeoff_defaults[0] as Record<string, unknown>)
            : (result.writeoff_defaults as Record<string, unknown> | undefined),
    );

    return {
        stageSpecStatus: pickString(result.stage_spec_status ?? result.stageSpecStatus) ?? "",
        stageSpecBannerVisible: pickBoolean(result.stage_spec_banner_visible ?? result.stageSpecBannerVisible),
        stageSpecBannerTitle: pickString(result.stage_spec_banner_title ?? result.stageSpecBannerTitle) ?? "",
        stageSpecBannerDetail: pickString(result.stage_spec_banner_detail ?? result.stageSpecBannerDetail) ?? "",
        alreadyRegisteredOnStage: pickBoolean(result.already_registered_on_stage ?? result.alreadyRegisteredOnStage),
        materialRollId: pickString(result.material_roll_id ?? result.materialRollId) ?? "",
        rollTraceContextId: pickString(result.roll_trace_context_id ?? result.rollTraceContextId) ?? "",
        stageRegistryRefreshHint: pickBoolean(result.stage_registry_refresh_hint ?? result.stageRegistryRefreshHint),
        seriesCard,
        writeoffDefaults,
    };
}
