import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import { buildMockSubmitPartialReturnResponse } from "../data/submit-partial-return";

export const submitPartialReturnHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/submitPartialReturn", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["SubmitPartialReturnRequest"];
        const workAreaId = body[0]?.workAreaId?.trim() ?? "";
        const materialRollId = body[0]?.materialRollId?.trim() ?? "";
        const barcode = body[0]?.barcode?.trim() ?? "";
        const length = body[0]?.length;
        const weight = body[0]?.weight;
        const warehouse = body[0]?.warehouse?.trim() ?? "";
        const operatorRef = body[0]?.operatorRef?.trim() ?? "";

        if (
            !workAreaId ||
            !materialRollId ||
            !barcode ||
            length === undefined ||
            weight === undefined ||
            !warehouse ||
            !operatorRef
        ) {
            return HttpResponse.json(
                {
                    message:
                        "Укажите workAreaId, materialRollId, barcode, length, weight, warehouse и operatorRef",
                },
                { status: 400 },
            );
        }

        return HttpResponse.json(
            buildMockSubmitPartialReturnResponse(
                workAreaId,
                materialRollId,
                barcode,
                length,
                weight,
                warehouse,
                operatorRef,
            ),
        );
    }),
];
