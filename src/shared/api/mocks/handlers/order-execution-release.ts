import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import {
    buildMockBatchReleasesResponse,
    buildMockPrepareReleaseLabelResponse,
    buildMockRegisterReleaseResponse,
    buildMockReleaseFormInitResponse,
    buildMockStageInputRollsResponse,
} from "../data/order-execution-release";

function readWorkAreaId(body: { workAreaId?: string }[] | undefined): string {
    return body?.[0]?.workAreaId?.trim() ?? "";
}

export const orderExecutionReleaseHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/getReleaseFormInit", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionReleaseWorkAreaRequest"];
        const workAreaId = readWorkAreaId(body);

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockReleaseFormInitResponse(workAreaId));
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/getBatchReleases", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionReleaseWorkAreaRequest"];
        const workAreaId = readWorkAreaId(body);

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockBatchReleasesResponse(workAreaId));
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/listStageInputRollsForWorkArea", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionReleaseWorkAreaRequest"];
        const workAreaId = readWorkAreaId(body);

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockStageInputRollsResponse(workAreaId));
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/registerRelease", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionRegisterReleaseRequest"];
        const item = body[0];
        const workAreaId = item?.workAreaId?.trim() ?? "";
        const seriesKey = item?.seriesKey?.trim() ?? "";
        const length = item?.length ?? 0;
        const weight = item?.weight ?? 0;

        return HttpResponse.json(buildMockRegisterReleaseResponse(workAreaId, seriesKey, length, weight));
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/prepareReleaseLabel", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionPrepareReleaseLabelRequest"];
        const workAreaId = body[0]?.workAreaId?.trim() ?? "";
        const materialProductionReleaseId = body[0]?.materialProductionReleaseId?.trim() ?? "";

        if (!workAreaId || !materialProductionReleaseId) {
            return HttpResponse.json({ message: "Укажите workAreaId и materialProductionReleaseId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockPrepareReleaseLabelResponse(workAreaId, materialProductionReleaseId));
    }),
];
