import { pickNumber, pickString } from "../map-event-registration-rpc-utils";
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

/** Собирает снимок сводки сигналов из узла `machine_signals_block` / результата getUnprocessedSignalsSummary. */
export function buildUnprocessedSignalsSummarySnapshot(
    record: Record<string, unknown>,
): UnprocessedSignalsSummarySnapshot {
    const rawSummary = record.summary;
    const summaryRows = Array.isArray(rawSummary)
        ? rawSummary
              .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
              .map(mapSummaryRow)
              .filter((row): row is UnprocessedSignalsSummaryRow => row !== null)
        : [];

    return {
        totalCount: pickNumber(record.total_count ?? record.totalCount) ?? 0,
        lastEventAt: pickString(record.last_event_at ?? record.lastEventAt) ?? "",
        changedAt: pickString(record.changed_at ?? record.changedAt) ?? null,
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

export { UNPROCESSED_SIGNALS_SUMMARY_EMPTY };
