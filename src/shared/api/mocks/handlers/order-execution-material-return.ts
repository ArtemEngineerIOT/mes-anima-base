import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockRegisterOrderExecutionMaterialReturnResponse } from "../data/order-execution-material-return";

export const orderExecutionMaterialReturnHandlers = [
    http.post(
        "/v1/contexts/users.admin.models.rest/functions/registerOrderExecutionMaterialReturn",
        async ({ request }) => {
            const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionMaterialReturnRequest"];
            const workAreaId = body[0]?.workAreaId?.trim();
            const barcode = body[0]?.barcode?.trim();
            const length = body[0]?.length;
            const weight = body[0]?.weight;
            const warehouse = body[0]?.warehouse?.trim();

            if (
                !workAreaId ||
                !barcode ||
                length === undefined ||
                weight === undefined ||
                !warehouse
            ) {
                return HttpResponse.json(
                    { message: "Укажите workAreaId, barcode, length, weight и warehouse" },
                    { status: 400 },
                );
            }

            return HttpResponse.json(
                buildMockRegisterOrderExecutionMaterialReturnResponse(
                    workAreaId,
                    barcode,
                    length,
                    weight,
                    warehouse,
                ),
            );
        },
    ),
];
