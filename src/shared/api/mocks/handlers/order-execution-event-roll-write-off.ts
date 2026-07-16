import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";
import {
    buildMockAcceptRawFromEventResponse,
    buildMockDiscardEventRollResponse,
    buildMockEventRollWriteOffResponse,
} from "../data/order-execution-event-roll-write-off";

export const orderExecutionEventRollWriteOffHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/eventRollWriteOff", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionReleaseWorkAreaRequest"];
        const workAreaId = body?.[0]?.workAreaId?.trim() ?? "";

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockEventRollWriteOffResponse(workAreaId, true));
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/discardEventRoll", async ({ request }) => {
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
            buildMockDiscardEventRollResponse({
                workAreaId,
                machineEventSignalId,
            }),
        );
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/acceptRawFromEvent", async ({ request }) => {
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
            buildMockAcceptRawFromEventResponse({
                workAreaId,
                machineEventSignalId,
            }),
        );
    }),
];
