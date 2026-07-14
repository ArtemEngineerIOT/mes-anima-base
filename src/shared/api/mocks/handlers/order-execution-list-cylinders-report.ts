import { http, HttpResponse } from "msw";

import { buildMockJbGetListCylindersResponse } from "../data/order-execution-list-cylinders-report";

export const orderExecutionListCylindersReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/jbGetListCylinders", async ({ request }) => {
        const body = (await request.json()) as { workAreaId?: string }[] | undefined;
        const workAreaId = body?.[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockJbGetListCylindersResponse());
    }),
];
