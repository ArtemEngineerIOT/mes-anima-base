import { HttpResponse } from "msw";

import { buildMockOrderExecutionResponse } from "../data/order-execution";
import { http } from "../http";
import type { ApiSchemas } from "../../schema";
import { verifyTokenOrThrow } from "../session";

export const orderExecutionHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/getOrderExecution", async ({ request }) => {
        await verifyTokenOrThrow(request);
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionRequest"];
        const resourceCode = body[0]?.resourceCode?.trim();

        if (!resourceCode) {
            return HttpResponse.json({ message: "Укажите resourceCode" }, { status: 400 });
        }

        return HttpResponse.json(buildMockOrderExecutionResponse(resourceCode));
    }),
];
