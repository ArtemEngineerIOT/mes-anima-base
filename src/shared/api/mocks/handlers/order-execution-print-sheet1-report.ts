import { HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";

import { buildMockJbPrintSheet1Response } from "../data/order-execution-print-sheet1-report";
import { http } from "../http";
import { verifyTokenOrThrow } from "../session";

export const orderExecutionPrintSheet1ReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/jbPrintSheet1", async ({ request }) => {
        await verifyTokenOrThrow(request);

        const body = (await request.json().catch(() => [])) as ApiSchemas["JbPrintSheet1Request"];
        const item = body?.[0];
        if (!item?.order?.trim() || !item?.workAreaStart?.trim()) {
            return HttpResponse.json({ message: "Укажите order и workAreaStart" }, { status: 400 });
        }

        return HttpResponse.json(buildMockJbPrintSheet1Response());
    }),
];
