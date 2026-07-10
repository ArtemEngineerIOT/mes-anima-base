import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockConvertConsumedLengthToWeightResponse } from "../data/convert-consumed-length-to-weight";

export const convertConsumedLengthToWeightHandlers = [
    http.post(
        "/v1/contexts/users.admin.models.rest/functions/convertConsumedLengthToWeight",
        async ({ request }) => {
            const body = (await request.json().catch(() => [])) as ApiSchemas["ConvertConsumedLengthToWeightRequest"];
            const workAreaId = body[0]?.workAreaId?.trim();
            const barcode = body[0]?.barcode?.trim();
            const length = body[0]?.length;

            if (!workAreaId || !barcode || length === undefined || length === null) {
                return HttpResponse.json({ message: "Укажите workAreaId, barcode и length" }, { status: 400 });
            }

            return HttpResponse.json(buildMockConvertConsumedLengthToWeightResponse(length, workAreaId, barcode));
        },
    ),
];
