export type TechnologicalParamHistoryEntry = {
    rollNumber: string;
    checkedAt: string;
    value: string;
};

/** Сколько колонок срезов видно одновременно (кроме «Старт»). */
export const PROCESS_PARAMS_SLICE_WINDOW_SIZE = 2;

export function getLastHistoryEntries(
    history: TechnologicalParamHistoryEntry[],
    count: number,
): TechnologicalParamHistoryEntry[] {
    if (count <= 0 || history.length === 0) {
        return [];
    }

    return history.slice(-count);
}

export function countLaterHistoryEntries(history: TechnologicalParamHistoryEntry[]): number {
    return Math.max(0, history.length - 1);
}

export function resolveMaxLaterHistoryCount(
    historyByRowId: Record<string, TechnologicalParamHistoryEntry[]>,
): number {
    let max = 0;
    for (const entries of Object.values(historyByRowId)) {
        max = Math.max(max, countLaterHistoryEntries(entries));
    }
    return max;
}

export function clampSliceWindowOffset(
    laterCount: number,
    offset: number,
    windowSize: number = PROCESS_PARAMS_SLICE_WINDOW_SIZE,
): number {
    const maxOffset = Math.max(0, laterCount - windowSize);
    return Math.min(Math.max(0, offset), maxOffset);
}

/** Смещение окна на последние видимые срезы (кроме «Старт»). */
export function lastSliceWindowOffset(
    laterCount: number,
    windowSize: number = PROCESS_PARAMS_SLICE_WINDOW_SIZE,
): number {
    return clampSliceWindowOffset(laterCount, laterCount, windowSize);
}

/** Первые `count` срезов по порядку `slices[]`, недостающие колонки справа — пустые. */
export function takeSequentialHistoryEntries(
    history: TechnologicalParamHistoryEntry[],
    count: number,
): Array<TechnologicalParamHistoryEntry | null> {
    return Array.from({ length: count }, (_, index) => history[index] ?? null);
}

/** Окно из `windowSize` срезов начиная с `offset` (после колонки «Старт»). */
export function takeSliceWindowEntries(
    laterHistory: TechnologicalParamHistoryEntry[],
    offset: number,
    windowSize: number = PROCESS_PARAMS_SLICE_WINDOW_SIZE,
): Array<TechnologicalParamHistoryEntry | null> {
    const clamped = clampSliceWindowOffset(laterHistory.length, offset, windowSize);
    return takeSequentialHistoryEntries(laterHistory.slice(clamped), windowSize);
}

export function padHistoryEntries(
    history: TechnologicalParamHistoryEntry[],
    count: number,
): Array<TechnologicalParamHistoryEntry | null> {
    const lastEntries = getLastHistoryEntries(history, count);
    const padding = Array.from({ length: Math.max(0, count - lastEntries.length) }, () => null);

    return [...padding, ...lastEntries];
}

export function appendHistoryEntry(
    history: TechnologicalParamHistoryEntry[],
    entry: TechnologicalParamHistoryEntry,
): TechnologicalParamHistoryEntry[] {
    return [...history, entry];
}

export function formatHistoryValue(entry: TechnologicalParamHistoryEntry | null): string {
    if (!entry) {
        return "—";
    }

    return entry.value;
}

/** @deprecated Используйте formatHistoryValue — в ячейке только значение, рулон/время в заголовке. */
export function formatHistoryCell(entry: TechnologicalParamHistoryEntry | null): string {
    return formatHistoryValue(entry);
}

function padDatePart(value: number): string {
    return String(value).padStart(2, "0");
}

function parseManualCheckedAtParts(value: string): Date | null {
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const dashDateTimeMatch = trimmed.match(
        /^(\d{2})-(\d{2})-(\d{4})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/,
    );
    if (dashDateTimeMatch) {
        const [, day, month, year, hours, minutes, seconds] = dashDateTimeMatch;
        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hours),
            Number(minutes),
            seconds ? Number(seconds) : 0,
        );
    }

    const dotDateTimeMatch = trimmed.match(
        /^(\d{2})\.(\d{2})\.(\d{4}),?\s*(\d{2}):(\d{2})(?::(\d{2}))?$/,
    );
    if (dotDateTimeMatch) {
        const [, day, month, year, hours, minutes, seconds] = dotDateTimeMatch;
        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hours),
            Number(minutes),
            seconds ? Number(seconds) : 0,
        );
    }

    const isoLocalMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (isoLocalMatch) {
        const [, year, month, day, hours, minutes, seconds] = isoLocalMatch;
        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hours),
            Number(minutes),
            seconds ? Number(seconds) : 0,
        );
    }

    return null;
}

export function formatManualCheckedAt(date: Date = new Date()): string {
    return `${padDatePart(date.getDate())}-${padDatePart(date.getMonth() + 1)}-${date.getFullYear()} ${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}:${padDatePart(date.getSeconds())}`;
}

export function formatManualCheckedAtForDateTimeLocal(date: Date = new Date()): string {
    return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}:${padDatePart(date.getSeconds())}`;
}

export function formatManualCheckedAtToDateTimeLocal(value: string): string {
    const parsed = parseManualCheckedAtParts(value);
    if (!parsed) {
        return "";
    }

    return formatManualCheckedAtForDateTimeLocal(parsed);
}

export function formatManualCheckedAtFromDateTimeLocal(value: string): string {
    const parsed = parseManualCheckedAtParts(value);
    if (!parsed) {
        return value.trim();
    }

    return formatManualCheckedAt(parsed);
}

export function createManualHistoryEntry(
    value: string,
    rollNumber: string,
    checkedAt?: string,
): TechnologicalParamHistoryEntry {
    const trimmedValue = value.trim();
    const trimmedRollNumber = rollNumber.trim() || "—";
    const trimmedCheckedAt = checkedAt?.trim() || formatManualCheckedAt();

    return {
        rollNumber: trimmedRollNumber,
        checkedAt: trimmedCheckedAt,
        value: trimmedValue,
    };
}
