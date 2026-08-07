import { buildUnprocessedSignalsSummarySnapshot } from "./event-registration/unprocessed-signals-summary/build-unprocessed-signals-summary-snapshot";
import type { UnprocessedSignalsSummarySnapshot } from "./event-registration/unprocessed-signals-summary/types";

function readWorkAreaId(value: unknown): string | null {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed ? trimmed : null;
    }
    return null;
}

export function mapOrderExecutionMachineSignalsBlockSummary(
    record: Record<string, unknown>,
    workAreaId: string | null,
): UnprocessedSignalsSummarySnapshot | null {
    const machineSignalsBlockRaw = record.machine_signals_block ?? record.machineSignalsBlock;
    if (!Array.isArray(machineSignalsBlockRaw) || machineSignalsBlockRaw.length === 0) {
        return null;
    }

    const blockItem =
        machineSignalsBlockRaw.find((item) => {
            if (!item || typeof item !== "object") {
                return false;
            }

            const itemWorkAreaId = readWorkAreaId((item as Record<string, unknown>).work_area_id);
            return workAreaId !== null && itemWorkAreaId === workAreaId;
        }) ?? machineSignalsBlockRaw[0];

    if (!blockItem || typeof blockItem !== "object") {
        return null;
    }

    const blockRecord = blockItem as Record<string, unknown>;
    const blockWorkAreaId = readWorkAreaId(blockRecord.work_area_id ?? blockRecord.workAreaId);

    if (workAreaId !== null && blockWorkAreaId !== null && blockWorkAreaId !== workAreaId) {
        return null;
    }

    return buildUnprocessedSignalsSummarySnapshot(blockRecord);
}
