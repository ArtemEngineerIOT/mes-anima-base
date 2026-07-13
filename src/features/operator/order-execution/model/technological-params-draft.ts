import type { TechnologicalParamsSections } from "./technological-params-mock";
import { formatManualCheckedAt } from "./technological-params-history";

export type ManualInputMeta = {
    rollNumber: string;
    checkedAt: string;
};

export type TechnologicalParamsDraft = {
    presserWidth: string;
    presserNumbers: Record<string, string>;
    manualValues: Record<string, string>;
    manualInputMeta: ManualInputMeta;
};

export function createDefaultManualInputMeta(rollNumber = ""): ManualInputMeta {
    return {
        rollNumber,
        checkedAt: formatManualCheckedAt(),
    };
}

export function buildTechnologicalParamsDraft(
    data: TechnologicalParamsSections,
    defaultRollNumber = "",
): TechnologicalParamsDraft {
    return {
        presserWidth: data.presserWidth,
        presserNumbers: Object.fromEntries(
            data.printingSections.map((row) => [row.id, row.presserNo]),
        ),
        manualValues: {},
        manualInputMeta: createDefaultManualInputMeta(defaultRollNumber),
    };
}

export function createEmptyManualDraft(rowIds: string[]): Record<string, string> {
    return Object.fromEntries(rowIds.map((rowId) => [rowId, ""]));
}

export type SavedPresserState = {
    width: string;
    numbers: Record<string, string>;
};

export function buildSavedPresserState(data: TechnologicalParamsSections): SavedPresserState {
    return {
        width: data.presserWidth,
        numbers: Object.fromEntries(data.printingSections.map((row) => [row.id, row.presserNo])),
    };
}
