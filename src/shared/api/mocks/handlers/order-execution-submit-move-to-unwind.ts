import { HttpResponse } from "msw";

import { buildMockSubmitMoveToUnwindResponse } from "../data/order-execution-submit-move-to-unwind";
import { http } from "../http";
import type { ApiSchemas } from "../../schema";
import { verifyTokenOrThrow } from "../session";

export const orderExecutionSubmitMoveToUnwindHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/submitMoveToUnwind", async ({ request }) => {
        await verifyTokenOrThrow(request);
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionSubmitMoveToUnwindRequest"];
        const item = body[0];
        const workAreaId = item?.workAreaId?.trim();
        const materialRollId = item?.materialRollId ?? "";
        const barcode = item?.barcode ?? "";
        const operatorRef = item?.operatorRef?.trim();

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        if (!operatorRef) {
            return HttpResponse.json({ message: "Укажите operatorRef" }, { status: 400 });
        }

        return HttpResponse.json(buildMockSubmitMoveToUnwindResponse(materialRollId, barcode));
    }),
];
