import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockSubmitStageLkmResponse } from "../data/submit-stage-lkm";

export const submitStageLkmHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/submitStageLkm", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["SubmitStageLkmRequest"];
        const workAreaId = body[0]?.workAreaId?.trim() ?? "";
        const operatorRef = body[0]?.operatorRef?.trim() ?? "";

        if (!workAreaId || !operatorRef) {
            return HttpResponse.json({ message: "Укажите workAreaId и operatorRef" }, { status: 400 });
        }

        return HttpResponse.json(buildMockSubmitStageLkmResponse(workAreaId, operatorRef));
    }),
];
