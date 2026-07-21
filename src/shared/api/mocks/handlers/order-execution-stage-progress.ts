import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockArmExecutionStageProgressResponse } from "../data/order-execution-stage-progress";

export const orderExecutionStageProgressHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/getProgress", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionReleaseWorkAreaRequest"];
        const workAreaId = body?.[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockArmExecutionStageProgressResponse(workAreaId));
    }),
];
