import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockOrderStageCompletionSubmitResponse } from "../data/order-execution-stage-completion-submit";

export const orderExecutionStageCompletionSubmitHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/orderStageCompletionSubmit", async ({ request }) => {
        const body =
            (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionStageCompletionSubmitRequest"];
        const item = body?.[0];
        const workAreaId = item?.workAreaId?.trim() ?? "";
        const completedBy = item?.completedBy?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(
            buildMockOrderStageCompletionSubmitResponse({
                workAreaId,
                completedBy,
            }),
        );
    }),
];
