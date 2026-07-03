import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockMaterialOrderPickCandidatesResponse } from "../data/material-order-pick-candidates";

export const materialOrderPickCandidatesHandlers = [
    http.post(
        "/v1/contexts/users.admin.models.rest/functions/listMaterialOrderPickCandidates",
        async ({ request }) => {
            const body = (await request.json().catch(() => [])) as ApiSchemas["MaterialOrderPickCandidatesRequest"];
            const workAreaId = body[0]?.workAreaId?.trim();

            if (!workAreaId) {
                return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
            }

            return HttpResponse.json(buildMockMaterialOrderPickCandidatesResponse(workAreaId));
        },
    ),
];
