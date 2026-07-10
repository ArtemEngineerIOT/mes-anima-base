import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockSubmitFullWriteOffResponse } from "../data/submit-full-write-off";

export const submitFullWriteOffHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/submitFullWriteOff", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["SubmitFullWriteOffRequest"];
        const workAreaId = body[0]?.workAreaId?.trim() ?? "";
        const materialRollId = body[0]?.materialRollId?.trim() ?? "";
        const barcode = body[0]?.barcode?.trim() ?? "";
        const operatorRef = body[0]?.operatorRef?.trim() ?? "";

        if (!workAreaId || !materialRollId || !barcode || !operatorRef) {
            return HttpResponse.json(
                { message: "Укажите workAreaId, materialRollId, barcode и operatorRef" },
                { status: 400 },
            );
        }

        return HttpResponse.json(
            buildMockSubmitFullWriteOffResponse(workAreaId, materialRollId, barcode, operatorRef),
        );
    }),
];
