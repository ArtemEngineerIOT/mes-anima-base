import { HttpResponse } from "msw";

import {
    findMockProductionPlanStageByWorkAreaId,
    hasMockProductionPlanStageInProgress,
    MOCK_PRODUCTION_PLAN_MACHINES,
    MOCK_PRODUCTION_PLAN_STAGES,
    mockProductionPlanOrderDate,
    setMockProductionPlanStageStatus,
    type MockProductionPlanStageRow,
} from "../data/production-plan";
import { http } from "../http";
import type { ApiSchemas } from "../../schema";
import { verifyTokenOrThrow } from "../session";

function stageActionError(errorCode: string, errorMessage: string) {
    return HttpResponse.json([
        {
            error_code: errorCode,
            error_message: errorMessage,
            result: [],
        },
    ]);
}

function stageActionSuccess(row: MockProductionPlanStageRow) {
    return HttpResponse.json([
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: row.work_area_id,
                    status_code: row.status_code,
                    warnings: [],
                    job_bag_id: "33",
                },
            ],
        },
    ]);
}

async function handleStartProductionPlanStage({ request }: { request: Request }): Promise<any> {
    await verifyTokenOrThrow(request);
    const body = (await request.json().catch(() => [])) as ApiSchemas["ProductionPlanStartStageRequest"];
    const workAreaId = body[0]?.workAreaId?.trim();
    const startedBy = body[0]?.startedBy?.trim();
    const row = workAreaId ? findMockProductionPlanStageByWorkAreaId(workAreaId) : undefined;

    if (!row) {
        return stageActionError("NOT_FOUND", "Этап не найден");
    }
    if (!startedBy) {
        return stageActionError("VALIDATION", "Укажите startedBy");
    }
    if (row.status_code !== "PLANNED") {
        return stageActionError("INVALID_STATE", "Этап нельзя взять в работу");
    }
    if (hasMockProductionPlanStageInProgress()) {
        return stageActionError("CONFLICT", "Уже есть этап в работе");
    }

    setMockProductionPlanStageStatus(row, "IN_PROGRESS");
    return stageActionSuccess(row);
}

async function handlePauseProductionPlanStage({ request }: { request: Request }): Promise<any> {
    await verifyTokenOrThrow(request);
    const body = (await request.json().catch(() => [])) as ApiSchemas["ProductionPlanPauseStageRequest"];
    const workAreaId = body[0]?.workAreaId?.trim();
    const startedBy = body[0]?.startedBy?.trim();
    const comment = body[0]?.comment?.trim();
    const row = workAreaId ? findMockProductionPlanStageByWorkAreaId(workAreaId) : undefined;

    if (!row) {
        return stageActionError("NOT_FOUND", "Этап не найден");
    }
    if (!startedBy) {
        return stageActionError("VALIDATION", "Укажите startedBy");
    }
    if (!comment) {
        return stageActionError("VALIDATION", "Укажите комментарий");
    }
    if (row.status_code !== "IN_PROGRESS") {
        return stageActionError("INVALID_STATE", "Этап не в работе");
    }

    setMockProductionPlanStageStatus(row, "PAUSED");
    return stageActionSuccess(row);
}

async function handleContinueProductionPlanStage({ request }: { request: Request }): Promise<any> {
    await verifyTokenOrThrow(request);
    const body = (await request.json().catch(() => [])) as ApiSchemas["ProductionPlanContinueStageRequest"];
    const workAreaId = body[0]?.workAreaId?.trim();
    const startedBy = body[0]?.startedBy?.trim();
    const row = workAreaId ? findMockProductionPlanStageByWorkAreaId(workAreaId) : undefined;

    if (!row) {
        return stageActionError("NOT_FOUND", "Этап не найден");
    }
    if (!startedBy) {
        return stageActionError("VALIDATION", "Укажите startedBy");
    }
    if (row.status_code !== "PAUSED") {
        return stageActionError("INVALID_STATE", "Этап не приостановлен");
    }
    if (hasMockProductionPlanStageInProgress()) {
        return stageActionError("CONFLICT", "Уже есть этап в работе");
    }

    setMockProductionPlanStageStatus(row, "IN_PROGRESS");
    return stageActionSuccess(row);
}

export const productionPlanHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/getProductionPlanMachines", async ({ request }) => {
        await verifyTokenOrThrow(request);
        return HttpResponse.json([...MOCK_PRODUCTION_PLAN_MACHINES]);
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/getProductionPlan", async ({ request }) => {
        await verifyTokenOrThrow(request);
        const body = (await request.json().catch(() => [])) as ApiSchemas["ProductionPlanRequest"];
        const { dateFrom, dateTo, resourceCode } = body[0] ?? {};

        let rows = MOCK_PRODUCTION_PLAN_STAGES;

        if (resourceCode != null) {
            rows = rows.filter(
                (row) => row.resource_id.toUpperCase() === String(resourceCode).toUpperCase(),
            );
        }
        if (dateFrom) {
            rows = rows.filter((row) => mockProductionPlanOrderDate(row) >= dateFrom);
        }
        if (dateTo) {
            rows = rows.filter((row) => mockProductionPlanOrderDate(row) <= dateTo);
        }

        return HttpResponse.json(rows);
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/startProductionPlanStage", handleStartProductionPlanStage),
    http.post("/v1/contexts/users.admin.models.rest/functions/pauseProductionPlanStage", handlePauseProductionPlanStage),
    http.post(
        "/v1/contexts/users.admin.models.rest/functions/continueProductionPlanStage",
        handleContinueProductionPlanStage,
    ),
];
