/** Код статуса этапа в ответе getProductionPlan (`status_code`). */
export type ProductionPlanStageStatusCode =
    | "PLANNED"
    | "IN_PROGRESS"
    | "PAUSED"
    | "DONE"
    | "CANCELLED";

type ProductionPlanStageStatusCodeDefinition = {
    code: ProductionPlanStageStatusCode;
    label: string;
};

/** Код бэка и каноническая подпись для моков и маппера. */
export const PRODUCTION_PLAN_STAGE_STATUS_CODE_DEFINITIONS = [
    { code: "PLANNED", label: "Запланирован" },
    { code: "IN_PROGRESS", label: "В работе" },
    { code: "PAUSED", label: "Приостановлен" },
    { code: "DONE", label: "Завершён" },
    { code: "CANCELLED", label: "Отменён" },
] as const satisfies readonly ProductionPlanStageStatusCodeDefinition[];

export const PRODUCTION_PLAN_STAGE_STATUS_CODES = PRODUCTION_PLAN_STAGE_STATUS_CODE_DEFINITIONS.map(
    (item) => item.code,
);

const STAGE_STATUS_LABEL_BY_CODE = Object.fromEntries(
    PRODUCTION_PLAN_STAGE_STATUS_CODE_DEFINITIONS.map((item) => [item.code, item.label]),
) as Record<ProductionPlanStageStatusCode, string>;

/** Альтернативные строки `status_code`, которые может прислать бэк. */
const STAGE_STATUS_CODE_ALIASES: Record<string, ProductionPlanStageStatusCode> = {
    PLANNED: "PLANNED",
    IN_PROGRESS: "IN_PROGRESS",
    INPROGRESS: "IN_PROGRESS",
    PAUSED: "PAUSED",
    DONE: "DONE",
    COMPLETED: "DONE",
    CANCELLED: "CANCELLED",
    CANCELED: "CANCELLED",
};

export function normalizeProductionPlanStageStatusCode(
    statusCode: unknown,
): ProductionPlanStageStatusCode {
    const normalized = String(statusCode ?? "PLANNED")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");

    return STAGE_STATUS_CODE_ALIASES[normalized] ?? "PLANNED";
}

export function productionPlanStageStatusLabelByCode(statusCode: ProductionPlanStageStatusCode): string {
    return STAGE_STATUS_LABEL_BY_CODE[statusCode];
}
