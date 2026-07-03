import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockMachineMaterialLocationResponse } from "../data/material-order-location";

export const materialOrderLocationHandlers = [
    http.post(
        "/v1/contexts/users.admin.models.rest/functions/getMachineMaterialLocation",
        async ({ request }) => {
            const body = (await request.json().catch(() => [])) as ApiSchemas["MachineMaterialLocationRequest"];
            const item = body[0];

            if (!item) {
                return HttpResponse.json({ message: "Пустой payload" }, { status: 400 });
            }

            return HttpResponse.json(buildMockMachineMaterialLocationResponse(item));
        },
    ),
];
