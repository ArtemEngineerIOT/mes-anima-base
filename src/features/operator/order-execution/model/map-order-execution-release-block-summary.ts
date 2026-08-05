import { buildReleaseProductionEventsSummarySnapshot } from "./release/production-events-summary/build-release-production-events-summary-snapshot";
import type { ReleaseProductionEventsSummarySnapshot } from "./release/production-events-summary/types";

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

export function mapOrderExecutionReleaseBlockSummary(
    record: Record<string, unknown>,
    workAreaId: string | null,
): ReleaseProductionEventsSummarySnapshot | null {
    const releaseBlockRaw = record.release_block ?? record.releaseBlock;
    if (!Array.isArray(releaseBlockRaw) || releaseBlockRaw.length === 0) {
        return null;
    }

    const releaseBlockItem =
        releaseBlockRaw.find((item) => {
            if (!item || typeof item !== "object") {
                return false;
            }

            const itemWorkAreaId = readWorkAreaId((item as Record<string, unknown>).work_area_id);
            return workAreaId !== null && itemWorkAreaId === workAreaId;
        }) ?? releaseBlockRaw[0];

    if (!releaseBlockItem || typeof releaseBlockItem !== "object") {
        return null;
    }

    const releaseRecord = releaseBlockItem as Record<string, unknown>;
    const releaseWorkAreaId = readWorkAreaId(releaseRecord.work_area_id ?? releaseRecord.workAreaId);

    if (workAreaId !== null && releaseWorkAreaId !== null && releaseWorkAreaId !== workAreaId) {
        return null;
    }

    return buildReleaseProductionEventsSummarySnapshot(releaseRecord);
}
