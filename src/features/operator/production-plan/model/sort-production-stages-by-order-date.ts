import type { ProductionStage } from "./types";

/** `none` — без сортировки (порядок с бэка); далее desc → asc. */
export type ProductionPlanOrderDateSortDirection = "none" | "desc" | "asc";

/** Парсит `orderDate` (ISO / `dd.MM.yyyy` / с временем) в timestamp для сортировки. */
export function parseProductionPlanOrderDate(value: string | null | undefined): number | null {
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

    const isoLike =
        /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?(?:\+\d{2}(?::?\d{2})?)?/.exec(
            trimmed,
        );
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

export function nextProductionPlanOrderDateSortDirection(
    current: ProductionPlanOrderDateSortDirection,
): ProductionPlanOrderDateSortDirection {
    if (current === "none") {
        return "desc";
    }
    if (current === "desc") {
        return "asc";
    }
    return "none";
}

export function sortProductionStagesByOrderDate(
    stages: readonly ProductionStage[],
    direction: ProductionPlanOrderDateSortDirection,
): ProductionStage[] {
    if (direction === "none") {
        return [...stages];
    }

    const multiplier = direction === "asc" ? 1 : -1;

    return [...stages].sort((left, right) => {
        const leftTs = parseProductionPlanOrderDate(left.orderDate);
        const rightTs = parseProductionPlanOrderDate(right.orderDate);

        if (leftTs === null && rightTs === null) {
            return `${left.workAreaId}:${left.stageId}`.localeCompare(
                `${right.workAreaId}:${right.stageId}`,
            );
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

        return `${left.workAreaId}:${left.stageId}`.localeCompare(
            `${right.workAreaId}:${right.stageId}`,
        );
    });
}
