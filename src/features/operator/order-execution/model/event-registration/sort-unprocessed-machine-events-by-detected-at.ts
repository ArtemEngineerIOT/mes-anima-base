import type { UnprocessedMachineEvent } from "./types";

export type UnprocessedMachineEventDetectedAtSortDirection = "asc" | "desc";

/** Парсит `detectedAt` вида `24.07.2026 08:32:48` (и ISO) в timestamp для сортировки. */
export function parseUnprocessedMachineEventDetectedAt(
    value: string | null | undefined,
): number | null {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed || trimmed === "—") {
        return null;
    }

    const localized = /^(\d{2})[./-](\d{2})[./-](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(
        trimmed,
    );
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

    const isoLike = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(trimmed);
    if (isoLike) {
        const year = Number(isoLike[1]);
        const month = Number(isoLike[2]);
        const day = Number(isoLike[3]);
        const hours = Number(isoLike[4] ?? 0);
        const minutes = Number(isoLike[5] ?? 0);
        const seconds = Number(isoLike[6] ?? 0);
        const timestamp = new Date(year, month - 1, day, hours, minutes, seconds).getTime();
        return Number.isNaN(timestamp) ? null : timestamp;
    }

    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
}

export function sortUnprocessedMachineEventsByDetectedAt(
    rows: readonly UnprocessedMachineEvent[],
    direction: UnprocessedMachineEventDetectedAtSortDirection,
): UnprocessedMachineEvent[] {
    const multiplier = direction === "asc" ? 1 : -1;

    return [...rows].sort((left, right) => {
        const leftTs = parseUnprocessedMachineEventDetectedAt(left.detectedAt);
        const rightTs = parseUnprocessedMachineEventDetectedAt(right.detectedAt);

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
