import type { InformerPillVariant } from "@/shared/ui/kit/informer-pill";
import type { InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";
import {
    normalizeProductionPlanStageStatusCode,
    productionPlanStageStatusLabelByCode,
    PRODUCTION_PLAN_STAGE_STATUS_CODE_DEFINITIONS,
    type ProductionPlanStageStatusCode,
} from "@/shared/lib/production-plan-stage-status-code";

export type { ProductionPlanStageStatusCode } from "@/shared/lib/production-plan-stage-status-code";

/** Нормализованный статус этапа в модели UI (`ProductionStage.status`). */
export type StageStatus = "planned" | "in_progress" | "paused" | "done" | "cancelled";

const STAGE_STATUS_BY_CODE: Record<ProductionPlanStageStatusCode, StageStatus> = {
    PLANNED: "planned",
    IN_PROGRESS: "in_progress",
    PAUSED: "paused",
    DONE: "done",
    CANCELLED: "cancelled",
};

/** Единый источник правды: код бэка → модель UI → подпись. */
export const PRODUCTION_PLAN_STAGE_STATUS_DEFINITIONS = PRODUCTION_PLAN_STAGE_STATUS_CODE_DEFINITIONS.map(
    (item) => ({
        code: item.code,
        status: STAGE_STATUS_BY_CODE[item.code],
        label: item.label,
    }),
);

export const STAGE_STATUS_VALUES = PRODUCTION_PLAN_STAGE_STATUS_DEFINITIONS.map((item) => item.status);

const STAGE_STATUS_CODE_BY_VALUE = Object.fromEntries(
    PRODUCTION_PLAN_STAGE_STATUS_DEFINITIONS.map((item) => [item.status, item.code]),
) as Record<StageStatus, ProductionPlanStageStatusCode>;

const STAGE_STATUS_LABEL_BY_VALUE = Object.fromEntries(
    PRODUCTION_PLAN_STAGE_STATUS_DEFINITIONS.map((item) => [item.status, item.label]),
) as Record<StageStatus, string>;

export function mapProductionPlanStageStatusCodeToStageStatus(
    statusCode: ProductionPlanStageStatusCode,
): StageStatus {
    return STAGE_STATUS_BY_CODE[statusCode];
}

export function mapStageStatusToProductionPlanStageStatusCode(status: StageStatus): ProductionPlanStageStatusCode {
    return STAGE_STATUS_CODE_BY_VALUE[status];
}

export function parseStageStatusFromBackend(statusCode: unknown): StageStatus {
    return mapProductionPlanStageStatusCodeToStageStatus(normalizeProductionPlanStageStatusCode(statusCode));
}

export function statusLabel(status: StageStatus): string {
    return STAGE_STATUS_LABEL_BY_VALUE[status];
}

export function statusLabelByCode(statusCode: ProductionPlanStageStatusCode): string {
    return productionPlanStageStatusLabelByCode(statusCode);
}

/** Подпись статуса для таблицы и фильтра: с бэка (`status` / `status_label`) или канон по `status_code`. */
export function productionStageStatusLabel(stage: {
    status: StageStatus;
    statusDisplayLabel?: string;
}): string {
    return stage.statusDisplayLabel?.trim() || statusLabel(stage.status);
}

export const PRODUCTION_PLAN_STAGE_STATUS_OPTIONS = STAGE_STATUS_VALUES.map((value) => ({
    value,
    label: statusLabel(value),
}));

export function stageStatusInformerTone(status: StageStatus): InformerTone {
    switch (status) {
        case "planned":
            return "system";
        case "in_progress":
            return "normal";
        case "paused":
            return "warning";
        case "done":
            return "success";
        case "cancelled":
            return "alert";
    }
}

export function stageStatusInformerVariant(status: StageStatus): InformerPillVariant {
    return status === "in_progress" ? "filled" : "outline";
}
