/** Строка ответа `getProductionPlan` (формат бэка). */
export type MockProductionPlanStageRow = {
    area_name: string;
    client_number: string;
    client_order_date: string;
    work_area_id: string;
    status_code: "PLANNED" | "IN_PROGRESS" | "PAUSED" | "DONE" | "CANCELLED";
    planned_start: string;
    row_group_key: string;
    produkt: string;
    planned_finish: string;
    output_item_name: string;
    etap: string;
    allowed_actions: string;
    status_ui_tone: string;
    proekt: string;
    id_operacii: string;
    resource_id: string;
    actual_start: string;
    actual_end: string;
    output_quantity: number;
    resource_name: string;
    order_id: string;
    client_name: string;
    output_unit: string;
    status: string;
    has_prev_unfinished?: boolean;
};

/** Строка ответа `getProductionPlanMachines`. */
export type MockProductionPlanMachineRow = {
    resourceCode: string;
};

const ALLOWED_ACTIONS = {
    start: '{"format":{"fields":[{"name":"action","type":"S"}],"maxRecords":2147483647,"minRecords":0},"records":[{"action":"start"}],"recordCount":1}',
    pause: '{"format":{"fields":[{"name":"action","type":"S"}],"maxRecords":2147483647,"minRecords":0},"records":[{"action":"pause"}],"recordCount":1}',
    continue:
        '{"format":{"fields":[{"name":"action","type":"S"}],"maxRecords":2147483647,"minRecords":0},"records":[{"action":"continue"}],"recordCount":1}',
} as const;

export const MOCK_PRODUCTION_PLAN_MACHINES: MockProductionPlanMachineRow[] = [
    { resourceCode: "PR110" },
    { resourceCode: "PR120" },
    { resourceCode: "PR130" },
    { resourceCode: "LM230" },
];

export const MOCK_PRODUCTION_PLAN_STAGES: MockProductionPlanStageRow[] = [
    {
        area_name: "2. Печать",
        client_number: "A00001",
        client_order_date: "2026-03-11 00:00:00+03",
        work_area_id: "191",
        status_code: "PLANNED",
        planned_start: "2026-02-01 10:00:01+03",
        row_group_key: "111780",
        produkt: "4045725 MMS Plain Black Currant 45g RU-BY FSI",
        planned_finish: "2026-02-01 18:00:01+03",
        output_item_name: "4045725 MMS Plain Black Currant 45g RU-BY FSI",
        etap: "2. Печать",
        allowed_actions: ALLOWED_ACTIONS.start,
        status_ui_tone: "other",
        proekt: "111780",
        id_operacii: "500001",
        resource_id: "PR110",
        actual_start: "",
        actual_end: "",
        output_quantity: 1_000_000,
        resource_name: "PR110",
        order_id: "111780",
        client_name: 'ООО "Марс"',
        output_unit: "шт",
        status: "Запланирован",
        has_prev_unfinished: true,
    },
    {
        area_name: "3. Резка",
        client_number: "A00002",
        client_order_date: "2026-03-11 00:00:00+03",
        work_area_id: "192",
        status_code: "IN_PROGRESS",
        planned_start: "2026-02-01 10:00:01+03",
        row_group_key: "120210",
        produkt: "4045725 MMS Plain Black Currant 45g RU-BY FSI",
        planned_finish: "2026-02-01 18:00:01+03",
        output_item_name: "4045725 MMS Plain Black Currant 45g RU-BY FSI",
        etap: "3. Резка",
        allowed_actions: ALLOWED_ACTIONS.pause,
        status_ui_tone: "other",
        proekt: "120210",
        id_operacii: "500002",
        resource_id: "PR110",
        actual_start: "2026-02-01 11:00:00+03",
        actual_end: "",
        output_quantity: 1_000_000,
        resource_name: "PR110",
        order_id: "120210",
        client_name: 'ООО "Марс"',
        output_unit: "шт",
        status: "В работе",
    },
    {
        area_name: "4. Ламинация",
        client_number: "A00002",
        client_order_date: "2026-03-11 00:00:00+03",
        work_area_id: "193",
        status_code: "PLANNED",
        planned_start: "2026-02-01 10:00:01+03",
        row_group_key: "120210",
        produkt: "4045725 MMS Plain Black Currant 45g RU-BY FSI",
        planned_finish: "2026-02-01 18:00:01+03",
        output_item_name: "4045725 MMS Plain Black Currant 45g RU-BY FSI",
        etap: "4. Ламинация",
        allowed_actions: ALLOWED_ACTIONS.start,
        status_ui_tone: "other",
        proekt: "120210",
        id_operacii: "500003",
        resource_id: "PR130",
        actual_start: "",
        actual_end: "",
        output_quantity: 1_000_000,
        resource_name: "PR130",
        order_id: "120210",
        client_name: 'ООО "Марс"',
        output_unit: "шт",
        status: "Запланирован",
    },
    {
        area_name: "2. Печать",
        client_number: "A00003",
        client_order_date: "2026-03-12 00:00:00+03",
        work_area_id: "194",
        status_code: "PAUSED",
        planned_start: "2026-02-02 08:00:00+03",
        row_group_key: "130501",
        produkt: "Snickers 50g",
        planned_finish: "2026-02-02 16:00:00+03",
        output_item_name: "Snickers 50g",
        etap: "2. Печать",
        allowed_actions: ALLOWED_ACTIONS.continue,
        status_ui_tone: "other",
        proekt: "130501",
        id_operacii: "500004",
        resource_id: "PR120",
        actual_start: "2026-02-02 08:05:00+03",
        actual_end: "",
        output_quantity: 500_000,
        resource_name: "PR120",
        order_id: "130501",
        client_name: 'ООО "Марс"',
        output_unit: "шт",
        status: "Приостановлен",
    },
];

export function findMockProductionPlanStage(operationId: string): MockProductionPlanStageRow | undefined {
    return MOCK_PRODUCTION_PLAN_STAGES.find((row) => row.id_operacii === operationId);
}

export function findMockProductionPlanStageByWorkAreaId(
    workAreaId: string,
): MockProductionPlanStageRow | undefined {
    return MOCK_PRODUCTION_PLAN_STAGES.find((row) => row.work_area_id === workAreaId);
}

export function hasMockProductionPlanStageInProgress(exceptOperationId?: string): boolean {
    return MOCK_PRODUCTION_PLAN_STAGES.some(
        (row) => row.status_code === "IN_PROGRESS" && row.id_operacii !== exceptOperationId,
    );
}

export function setMockProductionPlanStageStatus(
    row: MockProductionPlanStageRow,
    statusCode: MockProductionPlanStageRow["status_code"],
): void {
    row.status_code = statusCode;

    switch (statusCode) {
        case "PLANNED":
            row.status = "Запланирован";
            row.allowed_actions = ALLOWED_ACTIONS.start;
            break;
        case "IN_PROGRESS":
            row.status = "В работе";
            row.allowed_actions = ALLOWED_ACTIONS.pause;
            break;
        case "PAUSED":
            row.status = "Приостановлен";
            row.allowed_actions = ALLOWED_ACTIONS.continue;
            break;
        case "DONE":
            row.status = "Завершён";
            row.allowed_actions = '{"records":[],"recordCount":0}';
            break;
        case "CANCELLED":
            row.status = "Отменён";
            row.allowed_actions = '{"records":[],"recordCount":0}';
            break;
    }
}

export function mockProductionPlanOrderDate(row: MockProductionPlanStageRow): string {
    return row.client_order_date.slice(0, 10);
}
