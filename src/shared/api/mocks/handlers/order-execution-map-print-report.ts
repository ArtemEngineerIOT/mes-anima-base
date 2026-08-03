import { http, HttpResponse } from "msw";

import { buildMockJbMapPrintResponse } from "../data/order-execution-map-print-report";

export const orderExecutionMapPrintReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/jbMapPrint", async ({ request }) => {
        const body = (await request.json()) as { workAreaId?: string }[] | undefined;
        const workAreaId = body?.[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockJbMapPrintResponse());
    }),
];
