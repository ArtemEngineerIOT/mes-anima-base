import { PROCESS_CONTROL_CHECKLIST_ROWS } from "./process-control-data";
import type { ProcessControlFormState } from "./types";

export function buildProcessControlPayloadJson(form: ProcessControlFormState): string {
    const checklist = PROCESS_CONTROL_CHECKLIST_ROWS.map((row) => ({
        item_code: row.id,
        item_label: row.section,
        checked: row.hasValue ? Boolean(form.checklistValues[row.id]?.trim()) : Boolean(form.flags[row.id]),
        value: row.hasValue ? (form.checklistValues[row.id] ?? "") : "",
    }));

    const numericValues: Array<{ code: string; value: string }> = [];

    if (form.pressWidth.trim()) {
        numericValues.push({ code: "presser_width", value: form.pressWidth.trim() });
    }

    if (form.replacedElementsCount.trim()) {
        numericValues.push({ code: "replaced_elements_count", value: form.replacedElementsCount.trim() });
    }

    return JSON.stringify({
        tables: {
            checklist,
            numeric_values: numericValues,
        },
    });
}
