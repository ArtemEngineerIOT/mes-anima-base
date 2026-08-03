import { http, HttpResponse } from "msw";

import { buildMockJbFullPrintResponse } from "../data/order-execution-full-print-report";

export const orderExecutionFullPrintReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/jbFullPrint", async ({ request }) => {
        const body = (await request.json()) as { workAreaId?: string }[] | undefined;
        const workAreaId = body?.[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockJbFullPrintResponse());
    }),
];
