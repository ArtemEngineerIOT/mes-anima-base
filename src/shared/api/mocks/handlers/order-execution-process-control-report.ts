import { http, HttpResponse } from "msw";

import { buildMockJbProcessControlResponse } from "../data/order-execution-process-control-report";

export const orderExecutionProcessControlReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/jbProcessControl", async ({ request }) => {
        const body = (await request.json()) as { workAreaId?: string }[] | undefined;
        const workAreaId = body?.[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockJbProcessControlResponse());
    }),
];
