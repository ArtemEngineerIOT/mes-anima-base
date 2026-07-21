import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockUnprocessedSignalsSummaryResponse } from "../data/order-execution-unprocessed-signals-summary";

export const orderExecutionUnprocessedSignalsSummaryHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/getUnprocessedSignalsSummary", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionReleaseWorkAreaRequest"];
        const workAreaId = body?.[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockUnprocessedSignalsSummaryResponse(workAreaId));
    }),
];
