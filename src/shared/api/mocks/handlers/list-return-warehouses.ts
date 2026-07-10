import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockListReturnWarehousesResponse } from "../data/list-return-warehouses";

export const listReturnWarehousesHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/listReturnWarehouses", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["ListReturnWarehousesRequest"];
        const workAreaId = body[0]?.workAreaId?.trim() ?? "";
        const operatorRef = body[0]?.operatorRef?.trim() ?? "";

        if (!workAreaId || !operatorRef) {
            return HttpResponse.json({ message: "Укажите workAreaId и operatorRef" }, { status: 400 });
        }

        return HttpResponse.json(buildMockListReturnWarehousesResponse(workAreaId, operatorRef));
    }),
];
