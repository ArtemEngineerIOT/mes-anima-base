import { http, HttpResponse } from "msw";

import { buildMockTestPaintsRecipeResponse } from "../data/order-execution-paints-recipe-report";

export const orderExecutionPaintsRecipeReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/testPaintsRecipe", async () => {
        return HttpResponse.json(buildMockTestPaintsRecipeResponse());
    }),
];
