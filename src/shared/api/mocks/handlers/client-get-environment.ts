import { HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";

import { buildMockClientGetEnvironmentResponse } from "../data/client-get-environment";
import { http } from "../http";
import { verifyTokenOrThrow } from "../session";

export const clientGetEnvironmentHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/clientGetEnvironment", async ({ request }) => {
        await verifyTokenOrThrow(request);

        const body = (await request.json().catch(() => [])) as ApiSchemas["ClientGetEnvironmentRequest"];
        const operatorRef = body?.[0]?.operatorRef?.trim() ?? "";

        if (!operatorRef) {
            return HttpResponse.json({ message: "Укажите operatorRef" }, { status: 400 });
        }

        return HttpResponse.json(buildMockClientGetEnvironmentResponse(operatorRef));
    }),
];
