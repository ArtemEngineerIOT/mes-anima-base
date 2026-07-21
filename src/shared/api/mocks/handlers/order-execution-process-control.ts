import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import {
    buildMockProcessControlResponse,
    buildMockSaveProcessControlResponse,
} from "../data/order-execution-process-control";

export const orderExecutionProcessControlHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/getProcessControl", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionReleaseWorkAreaRequest"];
        const workAreaId = body?.[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockProcessControlResponse(workAreaId));
    }),
    http.post("/v1/contexts/users.admin.models.rest/functions/saveProcessControl", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionSaveProcessControlRequest"];
        const item = body?.[0];
        const workAreaId = item?.workAreaId?.trim() ?? "";
        const payloadJson = item?.payloadJson?.trim() ?? "";
        const operatorRef = item?.operatorRef?.trim() ?? "";

        if (!workAreaId || !payloadJson) {
            return HttpResponse.json({ message: "Укажите workAreaId и payloadJson" }, { status: 400 });
        }

        if (!operatorRef) {
            return HttpResponse.json({ message: "Укажите operatorRef" }, { status: 400 });
        }

        return HttpResponse.json(buildMockSaveProcessControlResponse(workAreaId, payloadJson));
    }),
];
