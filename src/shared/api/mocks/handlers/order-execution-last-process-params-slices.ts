import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockLastProcessParamsSlicesResponse } from "../data/order-execution-last-process-params-slices";

export const orderExecutionLastProcessParamsSlicesHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/getLastProcessParamsSlices", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionReleaseWorkAreaRequest"];
        const workAreaId = body?.[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockLastProcessParamsSlicesResponse(workAreaId));
    }),
];
