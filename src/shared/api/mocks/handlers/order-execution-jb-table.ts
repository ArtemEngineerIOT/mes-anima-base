import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockJbTableResponse } from "../data/order-execution-jb-table";

export const orderExecutionJbTableHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/getJbTable", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionGetJbTableRequest"];
        const machineId = body?.[0]?.machineId?.trim() ?? "";

        if (!machineId) {
            return HttpResponse.json({ message: "Укажите machineId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockJbTableResponse(machineId));
    }),
];
