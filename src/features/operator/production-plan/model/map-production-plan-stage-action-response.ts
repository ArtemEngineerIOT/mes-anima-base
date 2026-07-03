import type { ApiSchemas } from "@/shared/api/schema";

export type ProductionPlanStageActionOutcome = {
    workAreaId: string;
    statusCode: string;
    warnings: string[];
    jobBagId: string;
};

const OK_ERROR_CODE = "OK";

function readString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

/** Проверяет `error_code` в ответе start/pause/continue; при успехе возвращает первый элемент `result`. */
export function assertProductionPlanStageActionSuccess(
    payload: ApiSchemas["ProductionPlanStageActionResponse"] | undefined,
    fallbackMessage: string,
): ProductionPlanStageActionOutcome | undefined {
    const row = payload?.[0];
    if (!row) {
        throw new Error(fallbackMessage);
    }

    const errorCode = readString(row.error_code).toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(readString(row.error_message) || fallbackMessage);
    }

    const resultItem = row.result?.[0];
    if (!resultItem) {
        return undefined;
    }

    return {
        workAreaId: readString(resultItem.work_area_id),
        statusCode: readString(resultItem.status_code),
        warnings: Array.isArray(resultItem.warnings)
            ? resultItem.warnings.filter((warning): warning is string => typeof warning === "string")
            : [],
        jobBagId: readString(resultItem.job_bag_id),
    };
}
