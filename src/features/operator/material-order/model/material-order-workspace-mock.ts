import type { MaterialOrderMachineId, NomenclatureKindId } from "./types";

export type PlanOrderRow = {
    id: string;
    machineId: MaterialOrderMachineId;
    stage: string;
    orderId: string;
    orderDate: string;
    client: string;
    product: string;
    quantity: string;
    startAt: string;
    endAt: string;
    /** Статус строки плана для индикатора */
    planTone: "system" | "success" | "alert";
    planToneLabel: string;
};

export type MaterialOrderLine = {
    id: string;
    /** Код номенклатуры (`nomenclature_code`) */
    nomenclature: string;
    /** Наименование номенклатуры (`nomenclature_name`) */
    nomenclatureName: string;
    series: string;
    requestedQty: number;
    /** Единица измерения (`quantity_uom`) */
    quantityUom: string;
    /** Полуфабрикат — доступен тумблер рулонов */
    isSemiFinished: boolean;
    /** Плёнка — тумблер заблокирован (UC-12) */
    isFilm: boolean;
};

export type RollPickRow = {
    id: string;
    nomenclature: string;
    series: string;
    /** Доступное количество (`available_quantity`) */
    availableQuantity: number;
    unit: string;
    expiresAt: string;
    blocked: boolean;
};

export type LocationStatusKey = "ordered" | "available" | "blocked";

export type LocationRow = {
    id: string;
    machineId: string;
    nomenclature: string;
    kind: NomenclatureKindId;
    kindLabel: string;
    series: string;
    quantity: number;
    unit: string;
    status: LocationStatusKey;
    frCode: string | null;
    blocked?: boolean;
    rowSelectable?: boolean;
    blockReasonCode?: string;
    expiryDate?: string;
};

export type BlockReasonRow = {
    reasonCode: string;
    reasonLabel: string;
};

export const MOCK_PLAN_ORDERS: PlanOrderRow[] = [
    {
        id: "p1",
        machineId: "PR120",
        stage: "2. Печать",
        orderId: "111780",
        orderDate: "2026-03-11",
        client: 'ООО "Марс"',
        product: "MS Planin Black Currant 45g RU-BY FSI",
        quantity: "1 000 000 шт",
        startAt: "2026-02-01 10:00",
        endAt: "2026-02-01 18:00",
        planTone: "system",
        planToneLabel: "План",
    },
    {
        id: "p2",
        machineId: "PR120",
        stage: "3. Ламинация",
        orderId: "120210",
        orderDate: "2026-03-11",
        client: 'ООО "Марс"',
        product: "MS Planin Black Currant 45g RU-BY FSI",
        quantity: "500 000 шт",
        startAt: "2026-02-02 08:00",
        endAt: "2026-02-02 16:00",
        planTone: "success",
        planToneLabel: "В работе",
    },
    {
        id: "p3",
        machineId: "PR110",
        stage: "2. Печать",
        orderId: "130045",
        orderDate: "2026-03-12",
        client: 'АО "Сладкая жизнь"',
        product: "Плёнка BOPP 20 мкм",
        quantity: "2 000 кг",
        startAt: "2026-02-03 09:00",
        endAt: "2026-02-03 17:00",
        planTone: "alert",
        planToneLabel: "Стоп",
    },
];

export const MOCK_MATERIAL_LINES_INITIAL: MaterialOrderLine[] = [
    {
        id: "m1",
        nomenclature: "CP0001",
        nomenclatureName: "Краска печатная чёрная",
        series: "",
        requestedQty: 120,
        quantityUom: "кг",
        isSemiFinished: false,
        isFilm: false,
    },
    {
        id: "m2",
        nomenclature: "CP0002",
        nomenclatureName: "Плёнка BOPP прозрачная 20 мкм",
        series: "",
        requestedQty: 85,
        quantityUom: "рул",
        isSemiFinished: true,
        isFilm: false,
    },
    {
        id: "m3",
        nomenclature: "CP0003",
        nomenclatureName: "Клей растворимый дисперсионный",
        series: "",
        requestedQty: 40,
        quantityUom: "кг",
        isSemiFinished: false,
        isFilm: false,
    },
];

export const MOCK_ROLL_PICKS: RollPickRow[] = [
    {
        id: "r1",
        nomenclature: "CP0002",
        series: "L-8890-A",
        availableQuantity: 1,
        unit: "рул",
        expiresAt: "2027-01-15",
        blocked: false,
    },
    {
        id: "r2",
        nomenclature: "CP0002",
        series: "L-8890-B",
        availableQuantity: 1,
        unit: "рул",
        expiresAt: "2027-02-01",
        blocked: false,
    },
    {
        id: "r3",
        nomenclature: "CP0002",
        series: "L-7701",
        availableQuantity: 1,
        unit: "рул",
        expiresAt: "2026-12-20",
        blocked: true,
    },
];

export const MOCK_LOCATION_ROWS: LocationRow[] = [
    {
        id: "l1",
        machineId: "PR110",
        nomenclature: "Плёнка BOPP прозрачная 20 мкм",
        kind: "raw",
        kindLabel: "Сырьё",
        series: "S-2401",
        quantity: 80,
        unit: "кг",
        status: "available",
        frCode: null,
    },
    {
        id: "l2",
        machineId: "PR110",
        nomenclature: "CP0002",
        kind: "semi",
        kindLabel: "Полуфабрикат",
        series: "L-8890-A",
        quantity: 1,
        unit: "рул",
        status: "ordered",
        frCode: null,
    },
    {
        id: "l3",
        machineId: "PR110",
        nomenclature: "Клей растворимый дисперсионный",
        kind: "raw",
        kindLabel: "Сырьё",
        series: "K-102",
        quantity: 25,
        unit: "кг",
        status: "blocked",
        frCode: "1-2025",
    },
    {
        id: "l4",
        machineId: "PR120",
        nomenclature: "CP0002",
        kind: "semi",
        kindLabel: "Полуфабрикат",
        series: "L-8890-B",
        quantity: 1,
        unit: "рул",
        status: "available",
        frCode: null,
    },
];

/** Сводка при частичной доступности (UC-12, п. 11) */
export const MOCK_PARTIAL_AVAILABILITY_ROWS: { nomenclature: string; quantity: string; unit: string }[] = [
    { nomenclature: "Ламинат матовый 45 г/м²", quantity: "1", unit: "рул" },
];
