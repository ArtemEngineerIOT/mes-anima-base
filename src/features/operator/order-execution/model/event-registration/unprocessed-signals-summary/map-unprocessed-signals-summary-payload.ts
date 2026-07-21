import type { ApiSchemas } from "@/shared/api/schema";

import { assertEventRegistrationRpcOk, pickNumber, pickString } from "../map-event-registration-rpc-utils";
import {
    UNPROCESSED_SIGNALS_SUMMARY_EMPTY,
    type UnprocessedSignalsSummaryRow,
    type UnprocessedSignalsSummarySnapshot,
} from "./types";

function mapSummaryRow(row: Record<string, unknown>): UnprocessedSignalsSummaryRow | null {
    const signalName = pickString(row.signal_name ?? row.signalName) ?? "";
    const signalDescription = pickString(row.signal_description ?? row.signalDescription) ?? signalName;
    const count = pickNumber(row.count) ?? 0;

    if (!signalName && !signalDescription) {
        return null;
    }

    return {
        signalName: signalName || signalDescription,
        signalDescription: signalDescription || signalName,
        count,
    };
}

export function mapUnprocessedSignalsSummaryPayload(
    payload: ApiSchemas["OrderExecutionUnprocessedSignalsSummaryResponse"] | undefined,
): UnprocessedSignalsSummarySnapshot {
    const fallbackMessage = "Не удалось загрузить сводку сигналов с машины";
    const wrapper = payload?.[0];
    assertEventRegistrationRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    if (!resultItem) {
        return UNPROCESSED_SIGNALS_SUMMARY_EMPTY;
    }

    const rawSummary = resultItem.summary;
    const summaryRows = Array.isArray(rawSummary)
        ? rawSummary
              .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
              .map(mapSummaryRow)
              .filter((row): row is UnprocessedSignalsSummaryRow => row !== null)
        : [];

    return {
        totalCount: pickNumber(resultItem.total_count ?? resultItem.totalCount) ?? 0,
        lastEventAt: pickString(resultItem.last_event_at ?? resultItem.lastEventAt) ?? "",
        summaryRows,
    };
}

export function toUnprocessedSignalsSummaryPanelRows(snapshot: UnprocessedSignalsSummarySnapshot) {
    return snapshot.summaryRows.map((row) => ({
        characteristic: row.signalDescription,
        value: String(row.count),
        unit: "шт",
    }));
}
