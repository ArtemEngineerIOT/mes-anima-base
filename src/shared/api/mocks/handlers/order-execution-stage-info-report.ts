import { http, HttpResponse } from "msw";

import { buildMockJbGetStageInfoResponse } from "../data/order-execution-stage-info-report";

export const orderExecutionStageInfoReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/jbGetStageInfo", async ({ request }) => {
        const body = (await request.json()) as { workAreaId?: string }[] | undefined;
        const workAreaId = body?.[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockJbGetStageInfoResponse());
    }),
];
