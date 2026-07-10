import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockOrderExecutionStageRollRegistryResponse } from "../data/order-execution-stage-roll-registry";

export const orderExecutionStageRollRegistryHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/getStageRollRegistry", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionStageRollRegistryRequest"];
        const workAreaId = body[0]?.workAreaId?.trim();

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockOrderExecutionStageRollRegistryResponse(workAreaId));
    }),
];
