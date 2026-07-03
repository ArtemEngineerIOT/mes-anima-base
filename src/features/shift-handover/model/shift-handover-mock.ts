import { createRandomId } from "@/shared/lib/create-random-id";

export type AreaId = "print" | "lamination";

export type MachineId = "pr120" | "pr121" | "lm01";

export type EmployeeId = string;

export type ShiftPosition = "operator" | "assistant";

export type AssistantRole = "winding" | "unwinding";

export type NewShiftRow = {
    id: string;
    position: ShiftPosition | "";
    assistantRole: AssistantRole | "";
    employeeId: EmployeeId | "";
};

export const MOCK_AREAS: { id: AreaId; label: string }[] = [
    { id: "print", label: "Печать" },
    { id: "lamination", label: "Ламинация" },
];

export const MOCK_MACHINES_BY_AREA: Record<AreaId, { id: MachineId; label: string }[]> = {
    print: [
        { id: "pr120", label: "PR120" },
        { id: "pr121", label: "PR121" },
    ],
    lamination: [{ id: "lm01", label: "LM-01" }],
};

/** Сотрудники для выбора в новой смене; `busyOnMachine` — демо А1 UC-16 */
export const MOCK_EMPLOYEES: {
    id: EmployeeId;
    name: string;
    busyOnAnotherMachine?: string;
}[] = [
    { id: "e-alekseev", name: "Алексеев М.П." },
    { id: "e-sidorov", name: "Сидоров В.М." },
    { id: "e-fedorov", name: "Федоров Г.А." },
    { id: "e-morozov", name: "Морозов А.К.", busyOnAnotherMachine: "LM-02" },
    { id: "e-orlov", name: "Орлов П.С." },
];

export const MOCK_CURRENT_ORDER = {
    project: "111780",
    product: "4045725 MMS Plain Black Currant 45g RU-BY FSI",
    client: 'ООО "Марс"',
};

export const MOCK_CURRENT_SHIFT: { position: ShiftPosition; roleLabel: string; name: string }[] = [
    { position: "operator", roleLabel: "—", name: "Иванов И.С." },
    { position: "assistant", roleLabel: "Намотка", name: "Петров Г.В." },
    { position: "assistant", roleLabel: "Размотка", name: "Кузнецов Н.А." },
];

export function createEmptyNewShiftRow(): NewShiftRow {
    return {
        id: createRandomId("row-"),
        position: "assistant",
        assistantRole: "",
        employeeId: "",
    };
}

export function defaultNewShiftRows(): NewShiftRow[] {
    return [
        {
            id: createRandomId("row-"),
            position: "operator",
            assistantRole: "",
            employeeId: "e-alekseev",
        },
        {
            id: createRandomId("row-"),
            position: "assistant",
            assistantRole: "winding",
            employeeId: "e-sidorov",
        },
        {
            id: createRandomId("row-"),
            position: "assistant",
            assistantRole: "unwinding",
            employeeId: "e-fedorov",
        },
    ];
}
