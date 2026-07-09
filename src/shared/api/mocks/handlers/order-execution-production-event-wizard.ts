import { http, HttpResponse } from "msw";

import type { ApiSchemas } from "@/shared/api/schema";

import { buildMockProductionEventProcessJournalResponse } from "../data/order-execution-production-event-process-journal";
import { buildMockProductionEventRegisterResponse } from "../data/order-execution-production-event-register";
import { buildMockProductionEventWizardInitResponse } from "../data/order-execution-production-event-wizard";

type UnprocessedSignalRow = {
    signal_id: string;
    signal_name: string;
    time_start: string;
    time_end: string;
    length_start_m?: string;
    length_end_m?: string;
};

const unprocessedSignalsByWorkArea = new Map<string, UnprocessedSignalRow[]>();

function getUnprocessedSignals(workAreaId: string): UnprocessedSignalRow[] {
    const existing = unprocessedSignalsByWorkArea.get(workAreaId);
    if (existing) {
        return existing;
    }

    const initResponse = buildMockProductionEventWizardInitResponse(workAreaId);
    const seeded =
        (initResponse[0]?.result?.[0]?.unprocessed_signals as UnprocessedSignalRow[] | undefined) ?? [];
    unprocessedSignalsByWorkArea.set(workAreaId, [...seeded]);
    return unprocessedSignalsByWorkArea.get(workAreaId) ?? [];
}

function parseSignalIds(value: string | undefined): string[] {
    return (value ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
}

function readDiscardSignalsParams(
    body: ApiSchemas["OrderExecutionProductionEventWizardDiscardSignalsRequest"] | undefined,
): { workAreaId: string; signalIds: string[]; comment: string } {
    const item = body?.[0];
    return {
        workAreaId: item?.workAreaId?.trim() ?? "",
        signalIds: parseSignalIds(item?.signalIds),
        comment: item?.comment?.trim() ?? "",
    };
}

function buildMockDiscardSignalsResponse(
    workAreaId: string,
    signalIds: string[],
): ApiSchemas["OrderExecutionProductionEventWizardDiscardSignalsResponse"] {
    const current = getUnprocessedSignals(workAreaId);
    const idsToDiscard = new Set(signalIds);
    const next = current.filter((row) => !idsToDiscard.has(row.signal_id));
    unprocessedSignalsByWorkArea.set(workAreaId, next);

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    discarded_count: signalIds.length,
                    unprocessed_signals: next,
                },
            ],
        },
    ];
}

function readProcessJournalParams(
    body: ApiSchemas["OrderExecutionProductionEventProcessJournalRequest"] | undefined,
): { workAreaId: string } {
    const item = body?.[0];
    return {
        workAreaId: item?.workAreaId?.trim() ?? "",
    };
}

function readInitWizardParams(
    body: ApiSchemas["OrderExecutionProductionEventWizardInitRequest"] | undefined,
): { workAreaId: string; operatorRef: string } {
    const item = body?.[0];
    return {
        workAreaId: item?.workAreaId?.trim() ?? "",
        operatorRef: item?.operatorRef?.trim() ?? "",
    };
}

export const orderExecutionProductionEventWizardHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/initProductionEventWizard", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionProductionEventWizardInitRequest"];
        const { workAreaId, operatorRef } = readInitWizardParams(body);

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        if (!operatorRef) {
            return HttpResponse.json({ message: "Укажите operatorRef" }, { status: 400 });
        }

        const response = buildMockProductionEventWizardInitResponse(workAreaId);
        const seeded =
            (response[0]?.result?.[0]?.unprocessed_signals as UnprocessedSignalRow[] | undefined) ?? [];
        unprocessedSignalsByWorkArea.set(workAreaId, [...seeded]);

        return HttpResponse.json(response);
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/discardProductionEventSignals", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionProductionEventWizardDiscardSignalsRequest"];
        const { workAreaId, signalIds, comment } = readDiscardSignalsParams(body);

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        if (signalIds.length === 0) {
            return HttpResponse.json({ message: "Укажите signalIds" }, { status: 400 });
        }

        if (!comment) {
            return HttpResponse.json({ message: "Укажите comment" }, { status: 400 });
        }

        return HttpResponse.json(buildMockDiscardSignalsResponse(workAreaId, signalIds));
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/getProductionEventProcessJournal", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionProductionEventProcessJournalRequest"];
        const { workAreaId } = readProcessJournalParams(body);

        if (!workAreaId) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        return HttpResponse.json(buildMockProductionEventProcessJournalResponse(workAreaId));
    }),

    http.post("/v1/contexts/users.admin.models.rest/functions/registerProductionEvent", async ({ request }) => {
        const body = (await request.json().catch(() => [])) as ApiSchemas["OrderExecutionProductionEventRegisterRequest"];
        const item = body?.[0];

        if (!item?.wizardSessionId?.trim()) {
            return HttpResponse.json({ message: "Укажите wizardSessionId" }, { status: 400 });
        }

        if (!item?.workAreaId?.trim()) {
            return HttpResponse.json({ message: "Укажите workAreaId" }, { status: 400 });
        }

        if (!item?.eventCode?.trim()) {
            return HttpResponse.json({ message: "Укажите eventCode" }, { status: 400 });
        }

        if (typeof item?.removeImmediately !== "boolean") {
            return HttpResponse.json({ message: "Укажите removeImmediately" }, { status: 400 });
        }

        return HttpResponse.json(buildMockProductionEventRegisterResponse());
    }),
];
