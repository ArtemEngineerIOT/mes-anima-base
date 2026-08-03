import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";

import { buildMockSaveManualProcessParamsResponse } from "../data/order-execution-save-manual-process-params";

export const orderExecutionSaveManualProcessParamsHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/saveManualProcessParams", async ({ request }) => {
        const body =
            (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionSaveManualProcessParamsRequest"];
        const item = body?.[0];
        const workAreaId = item?.workAreaId?.trim() ?? "";
        const materialRollId = item?.materialRollId?.trim() ?? "";
        const externalSeriesKey = item?.externalSeriesKey?.trim() ?? "";
        const payloadJson = item?.payloadJson?.trim() ?? "";
        const operatorRef = item?.operatorRef?.trim() ?? "";

        if (!workAreaId || !materialRollId || !externalSeriesKey || !payloadJson) {
            return HttpResponse.json(
                { message: "Укажите workAreaId, materialRollId, externalSeriesKey и payloadJson" },
                { status: 400 },
            );
        }

        if (!operatorRef) {
            return HttpResponse.json({ message: "Укажите operatorRef" }, { status: 400 });
        }

        return HttpResponse.json(buildMockSaveManualProcessParamsResponse(workAreaId));
    }),
];
