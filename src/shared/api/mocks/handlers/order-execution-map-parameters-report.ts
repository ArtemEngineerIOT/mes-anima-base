import { http, HttpResponse } from "msw";

import { buildMockTestMapParametersResponse } from "../data/order-execution-map-parameters-report";

export const orderExecutionMapParametersReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/testMapParameters", async () => {
        return HttpResponse.json(buildMockTestMapParametersResponse());
    }),
];
