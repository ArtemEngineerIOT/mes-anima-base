import { MOCK_EMPLOYEES, type NewShiftRow } from "./shift-handover-mock";

export type ShiftHandoverValidation =
    | { ok: true }
    | { ok: false; message: string };

export function validateShiftHandover(rows: NewShiftRow[]): ShiftHandoverValidation {
    let operatorCount = 0;
    const usedEmployees = new Set<string>();

    for (const row of rows) {
        const empty = !row.position && !row.employeeId && !row.assistantRole;
        if (empty) continue;

        if (!row.position) {
            return { ok: false, message: "В каждой начатой строке выберите должность." };
        }
        if (!row.employeeId) {
            return { ok: false, message: "В каждой строке новой смены выберите сотрудника (ФИО)." };
        }
        if (row.position === "assistant" && !row.assistantRole) {
            return { ok: false, message: "Для помощника оператора укажите роль: намотка или размотка." };
        }

        if (row.position === "operator") {
            operatorCount += 1;
        }

        const emp = MOCK_EMPLOYEES.find((e) => e.id === row.employeeId);
        if (emp?.busyOnAnotherMachine) {
            return {
                ok: false,
                message: `Сотрудник ${emp.name} занят на другой машине (${emp.busyOnAnotherMachine}). Выберите другого сотрудника.`,
            };
        }

        if (usedEmployees.has(row.employeeId)) {
            return { ok: false, message: "Один сотрудник не может быть указан дважды в новой смене." };
        }
        usedEmployees.add(row.employeeId);
    }

    if (usedEmployees.size === 0) {
        return { ok: false, message: "Добавьте состав новой смены: оператор и при необходимости помощники." };
    }

    if (operatorCount !== 1) {
        return {
            ok: false,
            message: "В новой смене должна быть ровно одна должность «Оператор».",
        };
    }

    return { ok: true };
}

export function positionLabel(p: "operator" | "assistant" | ""): string {
    if (p === "operator") return "Оператор";
    if (p === "assistant") return "Помощник оператора";
    return "";
}
