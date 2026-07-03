import type {
    MachineData,
    OperatorDefectRegistration,
    OperatorDefectRemoval,
    OperatorDowntimeRow,
    OperatorDowntimesPanel,
    OperatorJbPanel,
    OrderExecutionOrderDetails,
} from "./types";

const emptyOrderDetails: OrderExecutionOrderDetails = {
    productAndOrder: [],
    targetIndicators: [],
    specification: [],
    orderComment: "",
};

const emptyJbPanel: OperatorJbPanel = {
    groups: [],
};

const pr120JbPanel: OperatorJbPanel = {
    headerCount: 3,
    groups: [
        {
            id: "by_sheet",
            title: "ПО ЛИСТАМ",
            rows: [
                {
                    id: "stage-info",
                    label: "Информация по этапу",
                    status: "ready_for_print",
                    statusLabel: "ГОТОВ К ПЕЧАТИ",
                },
                {
                    id: "cylinder-list",
                    label: "Список цилиндров",
                    status: "ready_for_print",
                    statusLabel: "ГОТОВ К ПЕЧАТИ",
                },
                {
                    id: "print-params-map",
                    label: "Карта технологических параметров печати",
                    status: "ready_for_print",
                    statusLabel: "ГОТОВ К ПЕЧАТИ",
                },
                {
                    id: "ink-recipe",
                    label: "Рецептура красок",
                    status: "ready_for_print",
                    statusLabel: "ГОТОВ К ПЕЧАТИ",
                },
                {
                    id: "section-label",
                    label: "Этикетка на секцию",
                    status: "ready_for_print",
                    statusLabel: "ГОТОВ К ПЕЧАТИ",
                },
                {
                    id: "process-control",
                    label: "Process control",
                    status: "preparation",
                    statusLabel: "ПОДГОТОВКА",
                },
                {
                    id: "color-control-map",
                    label: "Карта контроля цвета",
                    status: "ready_for_print",
                    statusLabel: "ГОТОВ К ПЕЧАТИ",
                },
            ],
        },
        {
            id: "whole_document",
            title: "ВЕСЬ ДОКУМЕНТ",
            rows: [
                {
                    id: "jb-whole",
                    label: "JB",
                    status: "preparation",
                    statusLabel: "ПОДГОТОВКА",
                },
            ],
        },
    ],
};

const pr120OrderDetails: OrderExecutionOrderDetails = {
    productAndOrder: [
        { parameter: "Проект", value: "111780" },
        { parameter: "Дата заказа", value: "2026-03-11 00:00:00 +03" },
        { parameter: "Клиент", value: 'ООО "Марс"' },
        { parameter: "Номер клиента", value: "A00023" },
        { parameter: "Операция", value: "Печать" },
        { parameter: "Продукт", value: "4045725 MMS Plain Black Currant 45g RU-BY FSI" },
        { parameter: "Количество", value: "100000.14" },
        { parameter: "Машина", value: "PR120" },
        { parameter: "Старт", value: "2026-02-01 10:00:01" },
        { parameter: "Завершение", value: "2026-02-01 10:00:01" },
    ],
    targetIndicators: [
        { parameter: "Вход на стадию MIN", value: "10" },
        { parameter: "Цель печати MAX", value: "8" },
        { parameter: "Цель печати MIN", value: "12" },
        { parameter: "Количество клиента минимум", value: "11" },
        { parameter: "Количество клиента максимум", value: "12" },
    ],
    specification: [
        { parameter: "Структура продукта", value: "10", unit: "10" },
        { parameter: "Стандарт цвета", value: "8", unit: "8" },
        { parameter: "Грамматура", value: "12", unit: "12" },
        { parameter: "Cut off", value: "11", unit: "11" },
        { parameter: "Количество линий", value: "12", unit: "12" },
        { parameter: "Ширина бобины", value: "11", unit: "11" },
        { parameter: "Длина намотки", value: "12", unit: "12" },
        { parameter: "Диаметр бобины, max", value: "11", unit: "11" },
        { parameter: "Диаметр бобины, min", value: "12", unit: "12" },
        { parameter: "Диаметр гильзы", value: "11", unit: "11" },
        { parameter: "Количество линий", value: "12", unit: "12" },
        { parameter: "Способ намотки", value: "11", unit: "11" },
        { parameter: "Метка", value: "12", unit: "12" },
        { parameter: "Количество склеек, max", value: "11", unit: "11" },
        { parameter: "Тип склейки", value: "12", unit: "12" },
        { parameter: "Цвет склейки", value: "11", unit: "11" },
        { parameter: "Ширина склейки", value: "12", unit: "12" },
        { parameter: "Флаг склейки", value: "11", unit: "11" },
        { parameter: "Толщина материала", value: "12", unit: "12" },
    ],
    orderComment: "",
};

const emptyDefectRegistration: OperatorDefectRegistration = {
    rows: [],
    defectTypeOptions: ["—"],
    flagOptions: ["—"],
    statusOptions: ["—"],
    rollOptions: ["—"],
};

const defectRegistrationCatalog: Pick<
    OperatorDefectRegistration,
    "defectTypeOptions" | "flagOptions" | "statusOptions" | "rollOptions"
> = {
    defectTypeOptions: ["Молнии", "Пятна", "Складки", "Пробой"],
    flagOptions: ["Желтый", "Зеленый", "Красный", "—"],
    statusOptions: ["Устранено", "Активно"],
    rollOptions: ["Р-120", "Р-121", "Р-122"],
};

const pr120DefectRegistration: OperatorDefectRegistration = {
    ...defectRegistrationCatalog,
    rows: [
        {
            id: "dr1",
            startM: "150",
            endM: "350",
            defectType: "Молнии",
            flag1: "Желтый",
            flag2: "Зеленый",
            status: "Устранено",
            roll: "Р-120",
        },
        {
            id: "dr2",
            startM: "480",
            endM: "620",
            defectType: "",
            flag1: "Желтый",
            flag2: "—",
            status: "Активно",
            roll: "Р-120",
        },
        {
            id: "dr3",
            startM: "3000",
            endM: "3750",
            defectType: "Пятна",
            flag1: "Зеленый",
            flag2: "Красный",
            status: "Устранено",
            roll: "Р-121",
        },
        {
            id: "dr4",
            startM: "4100",
            endM: "4280",
            defectType: "",
            flag1: "—",
            flag2: "Зеленый",
            status: "Активно",
            roll: "Р-121",
        },
        {
            id: "dr5",
            startM: "5020",
            endM: "5180",
            defectType: "Складки",
            flag1: "Красный",
            flag2: "Желтый",
            status: "Устранено",
            roll: "Р-122",
        },
    ],
};

const lm230DefectRegistration: OperatorDefectRegistration = {
    ...defectRegistrationCatalog,
    rows: [
        {
            id: "lm-dr1",
            startM: "150",
            endM: "350",
            defectType: "Молнии",
            flag1: "Желтый",
            flag2: "Зеленый",
            status: "Устранено",
            roll: "Р-120",
        },
        {
            id: "lm-dr2",
            startM: "900",
            endM: "1120",
            defectType: "Пятна",
            flag1: "Зеленый",
            flag2: "Зеленый",
            status: "Активно",
            roll: "Р-120",
        },
        {
            id: "lm-dr3",
            startM: "3000",
            endM: "3750",
            defectType: "Молнии",
            flag1: "Желтый",
            flag2: "Красный",
            status: "Устранено",
            roll: "Р-121",
        },
        {
            id: "lm-dr4",
            startM: "4000",
            endM: "4150",
            defectType: "Пробой",
            flag1: "Красный",
            flag2: "—",
            status: "Устранено",
            roll: "Р-121",
        },
        {
            id: "lm-dr5",
            startM: "4800",
            endM: "4950",
            defectType: "Складки",
            flag1: "Желтый",
            flag2: "Зеленый",
            status: "Активно",
            roll: "Р-122",
        },
    ],
};

const emptyDefectRemoval: OperatorDefectRemoval = {
    history: [],
    scaleOptions: ["—"],
    rollOptions: ["—"],
    defectTypeOptions: ["—"],
    formDefaults: { scaleId: "—", rollId: "—", defectType: "—", weightKg: "" },
};

const pr120DefectRemoval: OperatorDefectRemoval = {
    headerAlertCount: 1,
    scaleOptions: ["PR120_IN", "PR120_OUT"],
    rollOptions: ["P-001", "P-002", "P-003"],
    defectTypeOptions: ["Обрыв материала", "Молнии", "Пятна", "Складки"],
    formDefaults: {
        scaleId: "PR120_IN",
        rollId: "P-001",
        defectType: "Обрыв материала",
        weightKg: "18",
    },
    history: [
        {
            id: "rm1",
            registeredAt: "03-11-2028 12:00:00",
            weightKg: "18",
            lengthM: "120",
            defect: "Обрыв материала",
            note: "Замена термопары",
        },
        {
            id: "rm2",
            registeredAt: "03-11-2028 11:30:15",
            weightKg: "22",
            lengthM: "95",
            defect: "Молнии",
            note: "—",
        },
        {
            id: "rm3",
            registeredAt: "03-11-2028 10:05:40",
            weightKg: "15",
            lengthM: "200",
            defect: "Пятна",
            note: "Контроль цвета",
        },
        {
            id: "rm4",
            registeredAt: "03-11-2028 09:12:00",
            weightKg: "30",
            lengthM: "88",
            defect: "Обрыв материала",
            note: "—",
        },
        {
            id: "rm5",
            registeredAt: "03-11-2028 08:00:22",
            weightKg: "12",
            lengthM: "45",
            defect: "Складки",
            note: "Плановая остановка",
        },
    ],
};

const lm230DefectRemoval: OperatorDefectRemoval = {
    headerAlertCount: 0,
    scaleOptions: ["LM230_IN"],
    rollOptions: ["P-101", "P-102"],
    defectTypeOptions: ["Обрыв материала", "Молнии", "Пятна"],
    formDefaults: {
        scaleId: "LM230_IN",
        rollId: "P-101",
        defectType: "Пятна",
        weightKg: "9",
    },
    history: [
        {
            id: "lm-rm1",
            registeredAt: "03-11-2028 14:00:00",
            weightKg: "9",
            lengthM: "60",
            defect: "Пятна",
            note: "—",
        },
        {
            id: "lm-rm2",
            registeredAt: "03-11-2028 13:20:00",
            weightKg: "14",
            lengthM: "110",
            defect: "Молнии",
            note: "Повторный контроль",
        },
    ],
};

const downtimePicklists: Pick<
    OperatorDowntimesPanel,
    "categoryOptions" | "subcategoryOptions" | "reasonOptions" | "formDefaults"
> = {
    categoryOptions: ["Плановый", "Технический", "Организационный"],
    subcategoryOptions: ["Обслуживание машины", "Поломка", "Нет задания", "Плановый"],
    reasonOptions: ["Замена термопары", "Плановое ТО", "Ожидание материала"],
    formDefaults: {
        category: "Плановый",
        subcategory: "Обслуживание машины",
        reason: "Замена термопары",
    },
};

function downtimeRowsTwoPending(idPrefix: string): OperatorDowntimeRow[] {
    const filled = {
        category: "Технический",
        subcategory: "Поломка",
        reason: "Замена термопары",
    };
    return [
        {
            id: `${idPrefix}-1`,
            startAt: "03-11-2028 12:00:00",
            endAt: "03-11-2028 12:00:00",
            category: "",
            subcategory: "",
            reason: "",
        },
        {
            id: `${idPrefix}-2`,
            startAt: "03-11-2028 11:00:00",
            endAt: "03-11-2028 11:00:00",
            category: "",
            subcategory: "",
            reason: "",
        },
        {
            id: `${idPrefix}-3`,
            startAt: "03-11-2028 10:00:00",
            endAt: "03-11-2028 10:15:00",
            ...filled,
        },
        {
            id: `${idPrefix}-4`,
            startAt: "03-11-2028 09:00:00",
            endAt: "03-11-2028 09:20:00",
            ...filled,
        },
        {
            id: `${idPrefix}-5`,
            startAt: "03-11-2028 08:00:00",
            endAt: "03-11-2028 08:30:00",
            ...filled,
        },
    ];
}

function downtimeRowsAllFilled(): OperatorDowntimeRow[] {
    const filled = {
        category: "Технический",
        subcategory: "Поломка",
        reason: "Замена термопары",
    };
    return [
        {
            id: "lm-dt1",
            startAt: "03-11-2028 12:00:00",
            endAt: "03-11-2028 12:00:00",
            ...filled,
        },
        {
            id: "lm-dt2",
            startAt: "03-11-2028 11:00:00",
            endAt: "03-11-2028 11:00:00",
            ...filled,
        },
        {
            id: "lm-dt3",
            startAt: "03-11-2028 10:00:00",
            endAt: "03-11-2028 10:15:00",
            ...filled,
        },
        {
            id: "lm-dt4",
            startAt: "03-11-2028 09:00:00",
            endAt: "03-11-2028 09:20:00",
            ...filled,
        },
        {
            id: "lm-dt5",
            startAt: "03-11-2028 08:00:00",
            endAt: "03-11-2028 08:30:00",
            ...filled,
        },
    ];
}

/** UC-01: простой активен (таймер + незаполненные строки) */
const pr120Downtimes: OperatorDowntimesPanel = {
    uiMode: "active",
    activeSinceOffsetSeconds: 17 * 60 + 38,
    ...downtimePicklists,
    rows: downtimeRowsTwoPending("pr120"),
    defaultSelectedIds: ["pr120-1", "pr120-2"],
};

/** UC-01: простой завершён, классификация не завершена */
const pr110Downtimes: OperatorDowntimesPanel = {
    uiMode: "unregistered_pending",
    unregisteredDurationLabel: "01:20:41",
    ...downtimePicklists,
    rows: downtimeRowsTwoPending("pr110"),
    defaultSelectedIds: ["pr110-1", "pr110-2"],
};

/** UC-01: все записи обработаны */
const lm230Downtimes: OperatorDowntimesPanel = {
    uiMode: "idle",
    ...downtimePicklists,
    rows: downtimeRowsAllFilled(),
    defaultSelectedIds: [],
};

const emptyDowntimesPanel: OperatorDowntimesPanel = {
    uiMode: "idle",
    ...downtimePicklists,
    rows: [],
    defaultSelectedIds: [],
};

/** Заглушка для машины из API, по которой ещё нет данных экрана. */
export function buildOrderExecutionEmptyMachine(resourceCode: string): MachineData {
    return {
        machineId: resourceCode,
        hasAssignedStage: false,
        order: {
            orderId: "—",
            product: "—",
            client: "—",
            status: "Ожидание",
        },
        monitoring: {
            machineParams: [],
            inLine: { totalM: 0, rollInM: 0 },
            outLine: { totalM: 0, rollOutM: 0 },
            waste: [],
            output: [],
            downtimes: [],
            defects: [],
        },
        operator: {
            machineEvents: [],
            paramsTable: [],
            pendingKnifeStrike: null,
            jobInfo: [],
            orderDetails: emptyOrderDetails,
            defectRegistration: emptyDefectRegistration,
            defectRemoval: emptyDefectRemoval,
            downtimes: emptyDowntimesPanel,
            jb: emptyJbPanel,
        },
    };
}

export const ORDER_EXECUTION_MOCK: MachineData[] = [
    {
        machineId: "PR120",
        hasAssignedStage: true,
        order: {
            orderId: "123345",
            product: "4045725 MMS Plain Black Currant 45g RU-BY FSI",
            client: 'ООО "Марс"',
            status: "Исполнение заказа",
        },
        monitoring: {
            machineParams: [
                { label: "Статус машины", value: "Норма", tone: "good" },
                { label: "Скорость", value: "300 м/мин" },
                { label: "Таг машины", value: "Значение" },
            ],
            inLine: { totalM: 3600, rollInM: 1700 },
            outLine: { totalM: 3580, rollOutM: 2700 },
            waste: [
                { roll: "1", lengthM: 2000 },
                { roll: "2", lengthM: 2000 },
                { roll: "3", lengthM: 2000 },
            ],
            output: [
                { roll: "1", lengthM: 3000, composition: "1;2", reason: "-" },
                { roll: "2", lengthM: 2800, composition: "2;3", reason: "-" },
                { roll: "3", lengthM: 3100, composition: "3;4", reason: "Испорчен" },
            ],
            downtimes: [
                { date: "03-11-2028 12:00:00", reason: "Причина" },
                { date: "03-11-2028 10:00:00", reason: "Причина" },
                { date: "03-11-2028 08:00:00", reason: "Причина" },
            ],
            defects: [
                { date: "03-11-2028 12:00:00", reason: "Причина", qty: 10 },
                { date: "03-11-2028 10:00:00", reason: "Причина", qty: 15 },
            ],
        },
        operator: {
            machineEvents: [
                { time: "03-11-2028", reason: "Удаление брака" },
                { time: "03-11-2028", reason: "Удаление брака" },
                { time: "03-11-2028", reason: "Техническое обслуживание" },
                { time: "03-11-2028", reason: "Удаление брака" },
                { time: "03-11-2028", reason: "Завершение заказа" },
            ],
            paramsTable: [
                { parameter: "Параметр A", current: "135", target: "135", inTolerance: true },
                { parameter: "Параметр B", current: "170", target: "135", inTolerance: false },
                { parameter: "Параметр C", current: "135", target: "135", inTolerance: true },
                { parameter: "Параметр D", current: "135", target: "135", inTolerance: true },
                { parameter: "Параметр E", current: "135", target: "135", inTolerance: true },
            ],
            pendingKnifeStrike: {
                bannerTitle: "Удар ножа",
                bannerMessage:
                    "Внимание. В системе зафиксирован удар ножа. Заполните форму ниже и продолжите работу",
                reasonOptions: [
                    "Завершение исполнения заказа",
                    "Удаление брака",
                    "Техническое обслуживание",
                    "Окончание настройки",
                    "Брак",
                    "Смена заказа",
                    "Плановая операция",
                    "Ложное срабатывание",
                ],
                selectedReason: "Завершение исполнения заказа",
                queueCount: 2,
            },
            jobInfo: [
                { key: "Проект", value: "111780" },
                { key: "Продукт", value: "4045725 MMS Plain Black Currant 45g RU-BY FSI" },
                { key: "Заказ", value: "123345" },
                { key: "Клиент", value: 'ООО "Марс"' },
            ],
            orderDetails: pr120OrderDetails,
            defectRegistration: pr120DefectRegistration,
            defectRemoval: pr120DefectRemoval,
            downtimes: pr120Downtimes,
            jb: pr120JbPanel,
        },
    },
    {
        machineId: "PR110",
        hasAssignedStage: true,
        order: {
            orderId: "888001",
            product: "MS Plain Strawberry 45g RU-BY FSI",
            client: 'ООО "B"',
            status: "Ожидание",
        },
        monitoring: {
            machineParams: [
                { label: "Статус машины", value: "Ожидание", tone: "neutral" },
                { label: "Скорость", value: "0 м/мин" },
                { label: "Таг машины", value: "Значение" },
            ],
            inLine: { totalM: 0, rollInM: 0 },
            outLine: { totalM: 0, rollOutM: 0 },
            waste: [],
            output: [],
            downtimes: [{ date: "03-11-2028 12:00:00", reason: "Ожидание" }],
            defects: [],
        },
        operator: {
            machineEvents: [],
            paramsTable: [],
            pendingKnifeStrike: null,
            jobInfo: [
                { key: "Проект", value: "—" },
                { key: "Продукт", value: "—" },
                { key: "Заказ", value: "—" },
                { key: "Клиент", value: "—" },
            ],
            orderDetails: emptyOrderDetails,
            defectRegistration: emptyDefectRegistration,
            defectRemoval: emptyDefectRemoval,
            downtimes: pr110Downtimes,
            jb: emptyJbPanel,
        },
    },
    {
        machineId: "LM230",
        hasAssignedStage: true,
        order: {
            orderId: "777020",
            product: "MS Plain Apple 45g RU-BY FSI",
            client: 'ООО "C"',
            status: "Остановлен",
        },
        monitoring: {
            machineParams: [
                { label: "Статус машины", value: "Стоп", tone: "bad" },
                { label: "Скорость", value: "0 м/мин" },
                { label: "Таг машины", value: "Значение" },
            ],
            inLine: { totalM: 1200, rollInM: 300 },
            outLine: { totalM: 1100, rollOutM: 250 },
            waste: [{ roll: "1", lengthM: 200 }],
            output: [{ roll: "1", lengthM: 900, composition: "1;2", reason: "-" }],
            downtimes: [{ date: "03-11-2028 12:00:00", reason: "Остановка" }],
            defects: [{ date: "03-11-2028 12:00:00", reason: "Причина", qty: 2 }],
        },
        operator: {
            machineEvents: [
                { time: "03-11-2028 12:00:00", reason: "Удаление брака" },
                { time: "03-11-2028 11:45:00", reason: "Удаление брака" },
                { time: "03-11-2028 10:20:00", reason: "Техническое обслуживание" },
                { time: "03-11-2028 09:10:00", reason: "Удаление брака" },
                { time: "03-11-2028 08:00:00", reason: "Завершение заказа" },
            ],
            paramsTable: [
                { parameter: "Параметр A", current: "130", target: "135" },
                { parameter: "Параметр B", current: "170", target: "135" },
                { parameter: "Параметр C", current: "130", target: "135" },
                { parameter: "Параметр D", current: "130", target: "135" },
                { parameter: "Параметр E", current: "130", target: "135" },
            ],
            pendingKnifeStrike: null,
            jobInfo: [
                { key: "Проект", value: "111781" },
                { key: "Продукт", value: "MS Plain Apple 45g RU-BY FSI" },
                { key: "Заказ", value: "777020" },
                { key: "Клиент", value: 'ООО "C"' },
            ],
            orderDetails: {
                productAndOrder: [
                    { parameter: "Проект", value: "111781" },
                    { parameter: "Дата заказа", value: "2026-04-02 00:00:00 +03" },
                    { parameter: "Клиент", value: 'ООО "C"' },
                    { parameter: "Номер клиента", value: "B00091" },
                    { parameter: "Операция", value: "Печать" },
                    { parameter: "Продукт", value: "MS Plain Apple 45g RU-BY FSI" },
                    { parameter: "Количество", value: "50000" },
                    { parameter: "Машина", value: "LM230" },
                    { parameter: "Старт", value: "2026-04-02 08:15:00" },
                    { parameter: "Завершение", value: "—" },
                ],
                targetIndicators: [
                    { parameter: "Вход на стадию MIN", value: "5" },
                    { parameter: "Цель печати MAX", value: "7" },
                    { parameter: "Цель печати MIN", value: "9" },
                    { parameter: "Количество клиента минимум", value: "48000" },
                    { parameter: "Количество клиента максимум", value: "52000" },
                ],
                specification: [
                    { parameter: "Грамматура", value: "45", unit: "г/м²" },
                    { parameter: "Ширина бобины", value: "1200", unit: "мм" },
                    { parameter: "Диаметр гильзы", value: "76", unit: "мм" },
                ],
                orderComment: "Проверить цвет перед запуском.",
            },
            defectRegistration: lm230DefectRegistration,
            defectRemoval: lm230DefectRemoval,
            downtimes: lm230Downtimes,
            jb: emptyJbPanel,
        },
    },
];
