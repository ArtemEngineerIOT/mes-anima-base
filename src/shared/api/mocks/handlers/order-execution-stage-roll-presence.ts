import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockOrderExecutionStageRollPresenceResponse } from "../data/order-execution-stage-roll-presence";

export const orderExecutionStageRollPresenceHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/getStageRollPresence", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionStageRollPresenceRequest"];
        const workAreaId = body[0]?.workAreaId?.trim();

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockOrderExecutionStageRollPresenceResponse(workAreaId));
    }),
];
