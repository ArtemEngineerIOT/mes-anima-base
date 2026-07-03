import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockMaterialOrderPlanStagesResponse } from "../data/material-order-plan-stages";

export const materialOrderPlanStagesHandlers = [
    http.post(
        "/v1/contexts/users.admin.models.rest/functions/getMaterialOrderPlanStages",
        async ({ request }) => {
            const body = (await request.json().catch(() => [])) as ApiSchemas["MaterialOrderPlanStagesRequest"];
            const resourceCode = body[0]?.resourceCode?.trim();

            if (!resourceCode) {
                return HttpResponse.json({ message: "Укажите resourceCode" }, { status: 400 });
            }

            return HttpResponse.json(buildMockMaterialOrderPlanStagesResponse(resourceCode));
        },
    ),
];
