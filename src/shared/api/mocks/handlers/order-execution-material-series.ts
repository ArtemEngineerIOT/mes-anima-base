import { HttpResponse } from "msw";

import { buildMockOrderExecutionMaterialSeriesResponse } from "../data/order-execution-material-series";
import { http } from "../http";
import type { ApiSchemas } from "../../schema";
import { verifyTokenOrThrow } from "../session";

export const orderExecutionMaterialSeriesHandlers = [
    http.post(
        "/v1/contexts/users.admin.models.rest/functions/getOrderExecutionMaterialSeries",
        async ({ request }) => {
            await verifyTokenOrThrow(request);
            const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionMaterialSeriesRequest"];
            const barcode = body[0]?.barcode ?? "";
            const workAreaId = body[0]?.workAreaId?.trim();

            if (!workAreaId) {
                return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
            }

            return HttpResponse.json(buildMockOrderExecutionMaterialSeriesResponse(barcode, workAreaId));
        },
    ),
];
