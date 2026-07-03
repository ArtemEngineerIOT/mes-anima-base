import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockSubmitBlockRequestResponse } from "../data/material-order-submit-block";

export const materialOrderSubmitBlockHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/submitBlockRequest", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["SubmitBlockRequest"];
        const item = body[0];

        if (!item) {
            return HttpResponse.json({ message: "Пустой payload" }, { status: 400 });
        }

        return HttpResponse.json(buildMockSubmitBlockRequestResponse(item));
    }),
];
