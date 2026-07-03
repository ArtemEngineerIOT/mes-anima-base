export type ProcessControlFormState = {
    replacedElementsCount: string;
    pressWidth: string;
    flags: Record<string, boolean>;
};

export type ProcessControlChecklistRow = {
    id: string;
    section: string;
};

export type ProcessControlInfoBlock = {
    id: string;
    title: string;
    description: string;
};
