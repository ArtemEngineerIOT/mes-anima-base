import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockPrintOrderExecutionMaterialReturnLabelResponse } from "../data/order-execution-material-return-label";

export const orderExecutionMaterialReturnLabelHandlers = [
    http.post(
        "/v1/contexts/users.admin.models.rest/functions/printOrderExecutionMaterialReturnLabel",
        async ({ request }) => {
            const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionMaterialReturnLabelRequest"];
            const workAreaId = body[0]?.workAreaId?.trim();
            const materialRollId = body[0]?.materialRollId?.trim();

            if (!workAreaId || !materialRollId) {
                return HttpResponse.json({ message: "Укажите workAreaId и materialRollId" }, { status: 400 });
            }

            return HttpResponse.json(
                buildMockPrintOrderExecutionMaterialReturnLabelResponse(workAreaId, materialRollId),
            );
        },
    ),
];
