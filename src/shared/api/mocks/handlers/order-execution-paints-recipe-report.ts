import { http, HttpResponse } from "msw";

import { buildMockJbPaintsRecipeResponse } from "../data/order-execution-paints-recipe-report";

export const orderExecutionPaintsRecipeReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/jbPaintsRecipe", async ({ request }) => {
        const body = (await request.json()) as { workAreaId?: string }[] | undefined;
        const workAreaId = body?.[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockJbPaintsRecipeResponse());
    }),
];
