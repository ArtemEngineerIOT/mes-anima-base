import { http, HttpResponse } from "msw";

import { buildMockTestGetLabelSectionResponse } from "../data/order-execution-label-section-report";

export const orderExecutionLabelSectionReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/testGetLabelSection", async () => {
        return HttpResponse.json(buildMockTestGetLabelSectionResponse());
    }),
];
