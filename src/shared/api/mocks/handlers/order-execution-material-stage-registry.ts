import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockOrderExecutionMaterialStageRegistryResponse } from "../data/order-execution-material-stage-registry";

export const orderExecutionMaterialStageRegistryHandlers = [
    http.post(
        "/v1/contexts/users.admin.models.rest/functions/getOrderExecutionMaterialStageRegistry",
        async ({ request }) => {
            const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionMaterialStageRegistryRequest"];
            const workAreaId = body[0]?.workAreaId?.trim();

            if (!workAreaId) {
                return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
            }

            return HttpResponse.json(buildMockOrderExecutionMaterialStageRegistryResponse(workAreaId));
        },
    ),
];
