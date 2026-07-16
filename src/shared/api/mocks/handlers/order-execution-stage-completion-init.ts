import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockOrderStageCompletionInitResponse } from "../data/order-execution-stage-completion-init";

export const orderExecutionStageCompletionInitHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/orderStageCompletionInit", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionReleaseWorkAreaRequest"];
        const workAreaId = body?.[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockOrderStageCompletionInitResponse(workAreaId));
    }),
];
