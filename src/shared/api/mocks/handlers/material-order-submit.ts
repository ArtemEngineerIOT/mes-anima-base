import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockMaterialOrderSubmitResponse } from "../data/material-order-submit";

export const materialOrderSubmitHandlers = [
    http.post(
        "/v1/contexts/users.admin.models.rest/functions/submitMaterialOrderRequest",
        async ({ request }) => {
            const body = (await request.json().catch(() => [])) as ApiSchemas["MaterialOrderSubmitRequest"];
            return HttpResponse.json(buildMockMaterialOrderSubmitResponse(body));
        },
    ),
];
