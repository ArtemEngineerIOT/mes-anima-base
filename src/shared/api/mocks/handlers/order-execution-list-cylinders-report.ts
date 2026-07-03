import { http, HttpResponse } from "msw";

import { buildMockTestGetListCylindersResponse } from "../data/order-execution-list-cylinders-report";

export const orderExecutionListCylindersReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/testGetListCylinders", async () => {
        return HttpResponse.json(buildMockTestGetListCylindersResponse());
    }),
];
