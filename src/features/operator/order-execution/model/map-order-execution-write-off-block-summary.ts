import { buildRollWriteOffEventsSummarySnapshot } from "./materials-writeoff/raw-events-summary/build-roll-write-off-events-summary-snapshot";
import type { RollWriteOffEventsSummarySnapshot } from "./materials-writeoff/raw-events-summary/types";

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

export function mapOrderExecutionWriteOffBlockSummary(
    record: Record<string, unknown>,
    workAreaId: string | null,
): RollWriteOffEventsSummarySnapshot | null {
    const writeOffBlockRaw = record.write_off_block ?? record.writeOffBlock;
    if (!Array.isArray(writeOffBlockRaw) || writeOffBlockRaw.length === 0) {
        return null;
    }

    const writeOffBlockItem =
        writeOffBlockRaw.find((item) => {
            if (!item || typeof item !== "object") {
                return false;
            }

            const itemWorkAreaId = readWorkAreaId((item as Record<string, unknown>).work_area_id);
            return workAreaId !== null && itemWorkAreaId === workAreaId;
        }) ?? writeOffBlockRaw[0];

    if (!writeOffBlockItem || typeof writeOffBlockItem !== "object") {
        return null;
    }

    const writeOffRecord = writeOffBlockItem as Record<string, unknown>;
    const writeOffWorkAreaId = readWorkAreaId(writeOffRecord.work_area_id ?? writeOffRecord.workAreaId);

    if (workAreaId !== null && writeOffWorkAreaId !== null && writeOffWorkAreaId !== workAreaId) {
        return null;
    }

    return buildRollWriteOffEventsSummarySnapshot(writeOffRecord);
}
