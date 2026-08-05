import { HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";

import { buildMockJbPrintSheet6Response } from "../data/order-execution-print-sheet6-report";
import { http } from "../http";
import { verifyTokenOrThrow } from "../session";

export const orderExecutionPrintSheet6ReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/jbPrintSheet6", async ({ request }) => {
        await verifyTokenOrThrow(request);

        const body = (await request.json().catch(() => [])) as ApiSchemas["JbPrintSheet6Request"];
        const item = body?.[0];
        if (!item?.order?.trim()) {
            return HttpResponse.json({ message: "Укажите order" }, { status: 400 });
        }

        return HttpResponse.json(buildMockJbPrintSheet6Response());
    }),
];
