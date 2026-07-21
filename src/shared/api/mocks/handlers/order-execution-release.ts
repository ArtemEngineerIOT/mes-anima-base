import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import {
    buildMockBatchReleasesResponse,
    buildMockPrepareReleaseLabelResponse,
    buildMockRegisterReleaseResponse,
    buildMockReleaseFormInitResponse,
    buildMockStageInputRollsResponse,
} from "../data/order-execution-release";
import { buildMockReleaseProductionEventsSummaryResponse } from "../data/order-execution-release-production-events-summary";
import {
    buildMockEventReleaseProductionResponse,
    buildMockDiscardEventResponse,
    buildMockAcceptProdFromEventResponse,
} from "../data/order-execution-release-production-event";

function readWorkAreaId(body: { workAreaId?: string }[] | undefined): string {
    return body?.[0]?.workAreaId?.trim() ?? "";
}

export const orderExecutionReleaseHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/eventReleaseProduction", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionReleaseWorkAreaRequest"];
        const workAreaId = readWorkAreaId(body);

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockEventReleaseProductionResponse(workAreaId, true));
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/discardEvent", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionDiscardProductionEventRequest"];
        const item = body[0];
        const workAreaId = item?.workAreaId?.trim() ?? "";
        const machineEventSignalId = item?.machineEventSignalId?.trim() ?? "";

        if (!workAreaId || !machineEventSignalId) {
            return HttpResponse.json(
                { message: "Укажите workAreaId и machineEventSignalId" },
                { status: 400 },
            );
        }

        return HttpResponse.json(
            buildMockDiscardEventResponse({
                workAreaId,
                machineEventSignalId,
            }),
        );
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/acceptProdFromEvent", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionAcceptProdFromEventRequest"];
        const item = body[0];
        const workAreaId = item?.workAreaId?.trim() ?? "";
        const machineEventSignalId = item?.machineEventSignalId?.trim() ?? "";

        if (!workAreaId || !machineEventSignalId) {
            return HttpResponse.json(
                { message: "Укажите workAreaId и machineEventSignalId" },
                { status: 400 },
            );
        }

        return HttpResponse.json(
            buildMockAcceptProdFromEventResponse({
                workAreaId,
                machineEventSignalId,
            }),
        );
    }),

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

    http.post("/v1/contexts/users.admin.models.rest/functions/getEventsSummary", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionReleaseWorkAreaRequest"];
        const workAreaId = readWorkAreaId(body);

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockReleaseProductionEventsSummaryResponse(workAreaId));
    }),
];
