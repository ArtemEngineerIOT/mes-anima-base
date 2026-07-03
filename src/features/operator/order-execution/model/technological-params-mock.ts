import type { MachineId } from "./types";

/** Одна строка таблицы скорости (без колонок «параметр» / «ед. изм.»). */
export type TechnologicalSpeedRow = {
    standard: string;
    deviationPm: string;
    start: string;
    current: string;
    deviation: string;
    updated: string;
};

/** Строка размотки / намотки. */
export type TechnologicalParamRow = {
    label: string;
    unit: string;
    standard: string;
    deviationPm: string;
    start: string;
    current: string;
    deviation: string;
    updated: string;
    /** Подсветка строки вне допуска (как на макете). */
    alert?: boolean;
};

export type TechnologicalParamsSections = {
    speedTitle: string;
    speed: TechnologicalSpeedRow;
    unwinding1Title: string;
    unwinding1: TechnologicalParamRow[];
    unwinding2Title: string;
    unwinding2: TechnologicalParamRow[];
    winding1Title: string;
    winding1: TechnologicalParamRow[];
};

const MOCK_LM230: TechnologicalParamsSections = {
    speedTitle: "Скорость машины (м/мин)",
    speed: {
        standard: "300",
        deviationPm: "±10",
        start: "295",
        current: "298",
        deviation: "+3",
        updated: "03-11-2028 12:00:00",
    },
    unwinding1Title: "Размотка 1",
    unwinding1: [
        {
            label: "Натяжение до узла нанесения",
            unit: "Н",
            standard: "120",
            deviationPm: "±5",
            start: "118",
            current: "119",
            deviation: "+1",
            updated: "03-11-2028 12:00:00",
        },
        {
            label: "Натяжение на узле нанесения",
            unit: "Н",
            standard: "115",
            deviationPm: "±5",
            start: "112",
            current: "114",
            deviation: "+2",
            updated: "03-11-2028 12:00:00",
        },
        {
            label: "Натяжение после узла нанесения",
            unit: "Н",
            standard: "110",
            deviationPm: "±5",
            start: "108",
            current: "125",
            deviation: "+17",
            updated: "03-11-2028 12:00:00",
            alert: true,
        },
    ],
    unwinding2Title: "Размотка 2",
    unwinding2: [
        {
            label: "Натяжение рулона",
            unit: "Н",
            standard: "100",
            deviationPm: "±4",
            start: "99",
            current: "101",
            deviation: "+1",
            updated: "03-11-2028 12:00:00",
        },
        {
            label: "Угол входа",
            unit: "°",
            standard: "12",
            deviationPm: "±1",
            start: "12",
            current: "12",
            deviation: "0",
            updated: "03-11-2028 12:00:00",
        },
    ],
    winding1Title: "Намотка 1",
    winding1: [
        {
            label: "Натяжение намотки",
            unit: "Н",
            standard: "95",
            deviationPm: "±4",
            start: "94",
            current: "96",
            deviation: "+1",
            updated: "03-11-2028 12:00:00",
        },
        {
            label: "Укладка края",
            unit: "мм",
            standard: "0,5",
            deviationPm: "±0,1",
            start: "0,5",
            current: "0,52",
            deviation: "+0,02",
            updated: "03-11-2028 12:00:00",
        },
        {
            label: "Диаметр рулона",
            unit: "мм",
            standard: "800",
            deviationPm: "±20",
            start: "780",
            current: "795",
            deviation: "+15",
            updated: "03-11-2028 12:00:00",
        },
        {
            label: "Плотность намотки",
            unit: "%",
            standard: "92",
            deviationPm: "±2",
            start: "91",
            current: "93",
            deviation: "+1",
            updated: "03-11-2028 12:00:00",
        },
        {
            label: "Скорость намотки",
            unit: "м/мин",
            standard: "280",
            deviationPm: "±15",
            start: "275",
            current: "277",
            deviation: "+2",
            updated: "03-11-2028 12:00:00",
        },
        {
            label: "Выравнивание",
            unit: "мм",
            standard: "1",
            deviationPm: "±0,2",
            start: "1",
            current: "1,05",
            deviation: "+0,05",
            updated: "03-11-2028 12:00:00",
        },
        {
            label: "Температура вала",
            unit: "°C",
            standard: "45",
            deviationPm: "±3",
            start: "44",
            current: "46",
            deviation: "+1",
            updated: "03-11-2028 12:00:00",
        },
    ],
};

/** Пока общий мок для всех станков; при появлении API можно маппить по machineId. */
export function getTechnologicalParamsMock(machineId: MachineId): TechnologicalParamsSections {
    switch (machineId) {
        case "LM230":
        case "PR110":
        case "PR120":
        default:
            return MOCK_LM230;
    }
}
