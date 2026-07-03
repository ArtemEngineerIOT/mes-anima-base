import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockOrderExecutionMaterialWriteoffWeightResponse } from "../data/order-execution-material-writeoff-weight";

export const orderExecutionMaterialWriteoffWeightHandlers = [
    http.post(
        "/v1/contexts/users.admin.models.rest/functions/getOrderExecutionMaterialWriteoffWeight",
        async ({ request }) => {
            const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionMaterialWriteoffWeightRequest"];
            const workAreaId = body[0]?.workAreaId?.trim();
            const length = body[0]?.length;

            if (!workAreaId || length === undefined || length === null) {
                return HttpResponse.json({ message: "Укажите workAreaId и length" }, { status: 400 });
            }

            return HttpResponse.json(buildMockOrderExecutionMaterialWriteoffWeightResponse(length, workAreaId));
        },
    ),
];
