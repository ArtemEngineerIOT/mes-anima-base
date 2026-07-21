import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickString } from "../release/map-release-rpc-utils";
import { PROCESS_CONTROL_CHECKLIST_ROWS } from "./process-control-data";
import type { ProcessControlFormState } from "./types";

export type ProcessControlLoadResult = {
    form: ProcessControlFormState;
    updatedAt: string;
};

type ProcessControlChecklistItem = {
    item_code?: string;
    itemCode?: string;
    item_label?: string;
    itemLabel?: string;
    checked?: boolean;
    value?: string | number | boolean | null;
};

type ProcessControlNumericValueItem = {
    code?: string;
    value?: string | number | boolean | null;
};

type ProcessControlEncodedTables = {
    checklist?: ProcessControlChecklistItem[];
    numeric_values?: ProcessControlNumericValueItem[] | Record<string, unknown>;
    numericValues?: ProcessControlNumericValueItem[] | Record<string, unknown>;
};

type ProcessControlEncodedData = {
    tables?: ProcessControlEncodedTables;
};

function createEmptyFlags(): Record<string, boolean> {
    return Object.fromEntries(PROCESS_CONTROL_CHECKLIST_ROWS.map((row) => [row.id, false]));
}

function createEmptyChecklistValues(): Record<string, string> {
    return Object.fromEntries(
        PROCESS_CONTROL_CHECKLIST_ROWS.filter((row) => row.hasValue).map((row) => [row.id, ""]),
    );
}

export function createEmptyProcessControlForm(): ProcessControlFormState {
    return {
        replacedElementsCount: "",
        pressWidth: "",
        flags: createEmptyFlags(),
        checklistValues: createEmptyChecklistValues(),
    };
}

export function parseProcessControlEncodedData(value: unknown): ProcessControlEncodedData | null {
    if (typeof value === "string" && value.trim()) {
        try {
            const parsed = JSON.parse(value) as unknown;
            return typeof parsed === "object" && parsed !== null ? (parsed as ProcessControlEncodedData) : null;
        } catch {
            return null;
        }
    }

    if (typeof value === "object" && value !== null) {
        return value as ProcessControlEncodedData;
    }

    return null;
}

function readNumericValueFromObject(numericValues: Record<string, unknown>, codes: string[]): string {
    for (const key of codes) {
        const normalized = pickString(numericValues[key]);
        if (normalized !== undefined) {
            return normalized;
        }
    }

    return "";
}

function readNumericValueFromArray(numericValues: ProcessControlNumericValueItem[], codes: string[]): string {
    for (const code of codes) {
        const item = numericValues.find((entry) => pickString(entry.code) === code);
        const normalized = pickString(item?.value);
        if (normalized !== undefined) {
            return normalized;
        }
    }

    return "";
}

function readNumericValue(numericValues: unknown, codes: string[]): string {
    if (Array.isArray(numericValues)) {
        return readNumericValueFromArray(numericValues, codes);
    }

    if (typeof numericValues === "object" && numericValues !== null) {
        return readNumericValueFromObject(numericValues as Record<string, unknown>, codes);
    }

    return "";
}

function readChecklistItemCode(item: ProcessControlChecklistItem): string {
    return pickString(item.item_code ?? item.itemCode) ?? "";
}

function readChecklistChecked(item: ProcessControlChecklistItem): boolean {
    if (typeof item.checked === "boolean") {
        return item.checked;
    }

    const value = pickString(item.value);
    if (value === "true") {
        return true;
    }
    if (value === "false") {
        return false;
    }

    return false;
}

function readChecklistValue(item: ProcessControlChecklistItem): string {
    const value = item.value;
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    return "";
}

export function mapProcessControlEncodedData(encoded: ProcessControlEncodedData | null): ProcessControlFormState {
    if (!encoded?.tables) {
        return createEmptyProcessControlForm();
    }

    const numericValues = encoded.tables.numeric_values ?? encoded.tables.numericValues;
    const flags = createEmptyFlags();
    const checklistValues = createEmptyChecklistValues();

    const checklist = encoded.tables.checklist;
    if (Array.isArray(checklist)) {
        for (const item of checklist) {
            const itemCode = readChecklistItemCode(item);
            if (!itemCode || !(itemCode in flags)) {
                continue;
            }

            flags[itemCode] = readChecklistChecked(item);

            if (itemCode in checklistValues) {
                checklistValues[itemCode] = readChecklistValue(item);
            }
        }
    }

    return {
        replacedElementsCount: readNumericValue(numericValues, [
            "replaced_elements_count",
            "replacedElementsCount",
            "elements_replaced_count",
        ]),
        pressWidth: readNumericValue(numericValues, ["presser_width", "pressWidth", "press_width"]),
        flags,
        checklistValues,
    };
}

export function mapProcessControlPayload(
    payload: ApiSchemas["OrderExecutionProcessControlResponse"] | undefined,
): ProcessControlLoadResult {
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, "Не удалось загрузить контроль процесса");

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    if (!resultItem) {
        return { form: createEmptyProcessControlForm(), updatedAt: "" };
    }

    const encoded = parseProcessControlEncodedData(resultItem.encoded_data ?? resultItem.encodedData);
    return {
        form: mapProcessControlEncodedData(encoded),
        updatedAt: pickString(resultItem.updated_at ?? resultItem.updatedAt) ?? "",
    };
}

export function mapProcessControlSavePayload(
    payload: ApiSchemas["OrderExecutionSaveProcessControlResponse"] | undefined,
): string {
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, "Не удалось сохранить контроль процесса");

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    return pickString(resultItem?.updated_at ?? resultItem?.updatedAt) ?? "";
}
