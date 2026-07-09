import type { EventRegistrationSnapshot } from "./types";

export const EVENT_REGISTRATION_ALL_LINES_VALUE = "__all_lines__";
export const EVENT_REGISTRATION_ALL_LINES_LABEL = "Все ряды";

export type LineNumberOption = {
    value: string;
    label: string;
};

export function buildLineNumberOptions(snapshot: Pick<EventRegistrationSnapshot, "lineCount" | "lineNumberOptions">): LineNumberOption[] {
    const numbers =
        snapshot.lineNumberOptions.length > 0
            ? snapshot.lineNumberOptions
            : Array.from({ length: snapshot.lineCount }, (_, index) => String(index + 1));

    return [
        ...numbers.map((lineNumber) => ({ value: lineNumber, label: lineNumber })),
        { value: EVENT_REGISTRATION_ALL_LINES_VALUE, label: EVENT_REGISTRATION_ALL_LINES_LABEL },
    ];
}

export function toggleSelectedLine(selected: readonly string[], value: string): string[] {
    if (value === EVENT_REGISTRATION_ALL_LINES_VALUE) {
        return selected.includes(EVENT_REGISTRATION_ALL_LINES_VALUE) ? [] : [EVENT_REGISTRATION_ALL_LINES_VALUE];
    }

    const withoutAll = selected.filter((item) => item !== EVENT_REGISTRATION_ALL_LINES_VALUE);
    return withoutAll.includes(value)
        ? withoutAll.filter((item) => item !== value)
        : [...withoutAll, value];
}

export function formatSelectedLinesSummary(selected: readonly string[]): string {
    if (selected.includes(EVENT_REGISTRATION_ALL_LINES_VALUE)) {
        return EVENT_REGISTRATION_ALL_LINES_LABEL;
    }

    return selected.join(", ");
}
