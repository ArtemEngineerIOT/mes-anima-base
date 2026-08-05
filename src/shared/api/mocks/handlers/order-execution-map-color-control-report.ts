import { HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";

import { buildMockJbMapColorControlResponse } from "../data/order-execution-map-color-control-report";
import { http } from "../http";
import { verifyTokenOrThrow } from "../session";

export const orderExecutionMapColorControlReportHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/jbMapColorControl", async ({ request }) => {
        await verifyTokenOrThrow(request);

        const body = (await request.json().catch(() => [])) as ApiSchemas["JbMapColorControlRequest"];
        const item = body?.[0];
        if (!item?.order?.trim()) {
            return HttpResponse.json({ message: "Укажите order" }, { status: 400 });
        }

        return HttpResponse.json(buildMockJbMapColorControlResponse());
    }),
];
