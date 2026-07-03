import { http, HttpResponse } from "msw";

import { buildMockTestGetStageInfoResponse } from "../data/order-execution-stage-info-report";

export const orderExecutionStageInfoReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/testGetStageInfo", async () => {
        return HttpResponse.json(buildMockTestGetStageInfoResponse());
    }),
];
