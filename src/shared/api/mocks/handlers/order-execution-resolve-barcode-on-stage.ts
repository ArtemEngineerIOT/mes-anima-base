import { HttpResponse } from "msw";

import { buildMockResolveBarcodeOnStageResponse } from "../data/order-execution-resolve-barcode-on-stage";
import { http } from "../http";
import type { ApiSchemas } from "../../schema";
import { verifyTokenOrThrow } from "../session";

export const orderExecutionResolveBarcodeOnStageHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/resolveBarcodeOnStage", async ({ request }) => {
        await verifyTokenOrThrow(request);
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionResolveBarcodeOnStageRequest"];
        const item = body[0];
        const barcode = item?.barcode ?? "";
        const workAreaId = item?.workAreaId?.trim();
        const installationPlace = item?.installationPlace ?? "WAITING";
        const operatorRef = item?.operatorRef?.trim();

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        if (!operatorRef) {
            return HttpResponse.json({ message: "Укажите operatorRef" }, { status: 400 });
        }

        return HttpResponse.json(
            buildMockResolveBarcodeOnStageResponse(barcode, workAreaId, installationPlace),
        );
    }),
];
