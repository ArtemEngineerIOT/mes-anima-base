export type ProcessControlFormState = {
    replacedElementsCount: string;
    pressWidth: string;
    flags: Record<string, boolean>;
    /** Значения пунктов чеклиста с полем `value` (например DRAUGHT_GAUGES). */
    checklistValues: Record<string, string>;
};

export type ProcessControlChecklistRow = {
    /** `item_code` в `encoded_data.tables.checklist`. */
    id: string;
    section: string;
    /** Пункт с текстовым значением вместо/вместе с чекбоксом. */
    hasValue?: boolean;
};

export type ProcessControlInfoBlock = {
    id: string;
    title: string;
    description: string;
};
