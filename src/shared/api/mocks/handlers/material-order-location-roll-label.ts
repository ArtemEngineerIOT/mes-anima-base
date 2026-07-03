import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockReprintRollLabelBySeriesResponse } from "../data/material-order-location-roll-label";

export const materialOrderLocationRollLabelHandlers = [
    http.post(
        "/v1/contexts/users.admin.models.rest/functions/reprintRollLabelBySeries",
        async ({ request }) => {
            const body = (await request.json().catch(() => [])) as ApiSchemas["ReprintRollLabelBySeriesRequest"];
            const seriesRef = body[0]?.seriesRef;

            if (seriesRef == null || seriesRef === "") {
                return HttpResponse.json({ message: "Укажите seriesRef" }, { status: 400 });
            }

            return HttpResponse.json(buildMockReprintRollLabelBySeriesResponse(seriesRef));
        },
    ),
];
