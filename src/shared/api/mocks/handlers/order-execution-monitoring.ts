import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import {
    buildMockArmExecutionMonitoringRollTablesResponse,
    buildMockArmExecutionMonitoringStageEventsResponse,
    buildMockArmExecutionMonitoringSummaryResponse,
} from "../data/order-execution-monitoring";

function readRequestItem(
    body: { workAreaId?: string; previewLimit?: string }[] | undefined,
): { workAreaId: string; previewLimit: string } {
    const item = body?.[0];
    return {
        workAreaId: item?.workAreaId?.trim() ?? "",
        previewLimit: item?.previewLimit?.trim() ?? "3",
    };
}

export const orderExecutionMonitoringHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/getArmExecutionMonitoringSummary", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionReleaseWorkAreaRequest"];
        const { workAreaId } = readRequestItem(body);

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockArmExecutionMonitoringSummaryResponse(workAreaId));
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/getArmExecutionMonitoringRollTables", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionMonitoringRollTablesRequest"];
        const { workAreaId, previewLimit } = readRequestItem(body);

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockArmExecutionMonitoringRollTablesResponse(workAreaId, previewLimit));
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/getArmExecutionMonitoringStageEvents", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionReleaseWorkAreaRequest"];
        const { workAreaId } = readRequestItem(body);

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockArmExecutionMonitoringStageEventsResponse(workAreaId));
    }),
];
