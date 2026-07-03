import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockRegisterOrderExecutionMaterialFullWriteoffResponse } from "../data/order-execution-material-full-writeoff";

export const orderExecutionMaterialFullWriteoffHandlers = [
    http.post(
        "/v1/contexts/users.admin.models.rest/functions/registerOrderExecutionMaterialFullWriteoff",
        async ({ request }) => {
            const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionMaterialFullWriteoffRequest"];
            const workAreaId = body[0]?.workAreaId?.trim();
            const barcode = body[0]?.barcode?.trim();
            const warehouse = body[0]?.warehouse?.trim();

            if (!workAreaId || !barcode || !warehouse) {
                return HttpResponse.json(
                    { message: "Укажите workAreaId, barcode и warehouse" },
                    { status: 400 },
                );
            }

            return HttpResponse.json(
                buildMockRegisterOrderExecutionMaterialFullWriteoffResponse(workAreaId, barcode, warehouse),
            );
        },
    ),
];
