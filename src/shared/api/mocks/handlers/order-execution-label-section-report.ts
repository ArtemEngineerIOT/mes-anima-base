import { http, HttpResponse } from "msw";

import { buildMockJbLabelSectionResponse } from "../data/order-execution-label-section-report";

export const orderExecutionLabelSectionReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/jbLabelSection", async ({ request }) => {
        const body = (await request.json()) as { workAreaId?: string }[] | undefined;
        const workAreaId = body?.[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockJbLabelSectionResponse());
    }),
];
