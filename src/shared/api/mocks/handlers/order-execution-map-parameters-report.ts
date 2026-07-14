import { http, HttpResponse } from "msw";

import { buildMockJbMapParametersResponse } from "../data/order-execution-map-parameters-report";

export const orderExecutionMapParametersReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/jbMapParameters", async ({ request }) => {
        const body = (await request.json()) as { workAreaId?: string }[] | undefined;
        const workAreaId = body?.[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockJbMapParametersResponse());
    }),
];
