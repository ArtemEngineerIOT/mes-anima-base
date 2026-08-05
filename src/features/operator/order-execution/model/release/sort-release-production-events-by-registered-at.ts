import { getReleaseProductionEventCellValue } from "./map-event-release-production-payload";
import type { ReleaseProductionEventListRow } from "./production-event-types";

export type ReleaseProductionEventTimeSortDirection = "asc" | "desc";

/** Парсит `registered_at` вида `24.07.2026 08:32:48` (и ISO) в timestamp для сортировки. */
export function parseReleaseProductionEventRegisteredAt(
    value: string | number | null | undefined,
): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const localized = /^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(trimmed);
    if (localized) {
        const day = Number(localized[1]);
        const month = Number(localized[2]);
        const year = Number(localized[3]);
        const hours = Number(localized[4] ?? 0);
        const minutes = Number(localized[5] ?? 0);
        const seconds = Number(localized[6] ?? 0);
        const timestamp = new Date(year, month - 1, day, hours, minutes, seconds).getTime();
        return Number.isNaN(timestamp) ? null : timestamp;
    }

    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
}

export function sortReleaseProductionEventListByRegisteredAt(
    rows: readonly ReleaseProductionEventListRow[],
    direction: ReleaseProductionEventTimeSortDirection,
): ReleaseProductionEventListRow[] {
    const multiplier = direction === "asc" ? 1 : -1;

    return [...rows].sort((left, right) => {
        const leftTs = parseReleaseProductionEventRegisteredAt(
            getReleaseProductionEventCellValue(left, "registered_at"),
        );
        const rightTs = parseReleaseProductionEventRegisteredAt(
            getReleaseProductionEventCellValue(right, "registered_at"),
        );

        if (leftTs === null && rightTs === null) {
            return left.id.localeCompare(right.id);
        }
        if (leftTs === null) {
            return 1;
        }
        if (rightTs === null) {
            return -1;
        }

        if (leftTs !== rightTs) {
            return (leftTs - rightTs) * multiplier;
        }

        return left.id.localeCompare(right.id);
    });
}
