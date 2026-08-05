import { HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";

import { buildMockJbPrintSheet3Response } from "../data/order-execution-print-sheet3-report";
import { http } from "../http";
import { verifyTokenOrThrow } from "../session";

export const orderExecutionPrintSheet3ReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/jbPrintSheet3", async ({ request }) => {
        await verifyTokenOrThrow(request);

        const body = (await request.json().catch(() => [])) as ApiSchemas["JbPrintSheet3Request"];
        const item = body?.[0];
        if (!item?.order?.trim() || !item?.workAreaStart?.trim()) {
            return HttpResponse.json({ message: "Укажите order и workAreaStart" }, { status: 400 });
        }

        return HttpResponse.json(buildMockJbPrintSheet3Response());
    }),
];
