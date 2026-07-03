import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockMaterialOrderComposeResponse } from "../data/material-order-compose";

export const materialOrderComposeHandlers = [
    http.post(
        "/v1/contexts/users.admin.models.rest/functions/composeMaterialOrderLines",
        async ({ request }) => {
            const body = (await request.json().catch(() => [])) as ApiSchemas["MaterialOrderComposeRequest"];
            const workAreaIds = body[0]?.workAreaIds?.trim();

            if (!workAreaIds) {
                return HttpResponse.json({ message: "Укажите workAreaIds" }, { status: 400 });
            }

            return HttpResponse.json(buildMockMaterialOrderComposeResponse(workAreaIds));
        },
    ),
];
