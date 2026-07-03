import { HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockActiveInputPrefillResponse } from "../data/order-execution-active-input-prefill";
import { http } from "../http";
import { verifyTokenOrThrow } from "../session";

export const orderExecutionActiveInputPrefillHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/getActiveInputPrefill", async ({ request }) => {
        await verifyTokenOrThrow(request);
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionActiveInputPrefillRequest"];
        const workAreaId = body[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockActiveInputPrefillResponse(workAreaId));
    }),
];
