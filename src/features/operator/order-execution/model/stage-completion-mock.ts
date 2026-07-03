import type { MachineId } from "./types";

export type StageIncomingRollRow = {
    id: string;
    material: string;
    nomenclature: string;
    series: string;
    quantity: number;
    unit: string;
    machine: string;
    status: "Заказано" | "Доступно" | "Заблокирован";
    fr: string;
};

export type StageReleasedSeriesRow = {
    id: string;
    article: string;
    nomenclature: string;
    rewind: boolean;
    series: string;
    netWeight: number;
    grossWeight: number;
    unit: string;
    quantity: number;
    fr: string;
    blocked: boolean;
};

export type StageEventDetailRow = {
    parameter: string;
    value: string;
};

export type StageEventJournalRow = {
    id: string;
    eventCode: string;
    start: string;
    end: string;
    meterage: number;
    details?: StageEventDetailRow[];
};

export type StagePendingEventRow = {
    id: string;
    signal: string;
    start: string;
    end: string;
};

export type StageCompletionSnapshot = {
    incomingRolls: StageIncomingRollRow[];
    releasedSeries: StageReleasedSeriesRow[];
    eventJournal: StageEventJournalRow[];
    pendingEvents: StagePendingEventRow[];
    totalEventMeterage: number;
    defectPercent: number;
    /** UC-16 A3: на машине есть приостановленный этап */
    hasSuspendedStageOnMachine: boolean;
    suspendedStageLabel?: string;
};

export function getStageCompletionSnapshot(machineId: MachineId): StageCompletionSnapshot {
    const base: StageCompletionSnapshot = {
        incomingRolls: [
            {
                id: "i1",
                material: "SR00051 Sterilised+7 v1.5 kg",
                nomenclature: "Сырьё",
                series: "521411",
                quantity: 2350,
                unit: "кг",
                machine: "PR110",
                status: "Заказано",
                fr: "-",
            },
            {
                id: "i2",
                material: "SR00051 Sterilised+7 v1.5 kg",
                nomenclature: "ПФ",
                series: "521411",
                quantity: 2350,
                unit: "кг",
                machine: "PR110",
                status: "Заказано",
                fr: "-",
            },
            {
                id: "i3",
                material: "SR00051 Sterilised+7 v1.5 kg",
                nomenclature: "ГП",
                series: "521411",
                quantity: 2350,
                unit: "кг",
                machine: "PR110",
                status: "Заблокирован",
                fr: "1-2025",
            },
            {
                id: "i4",
                material: "SR00051 Sterilised+7 v1.5 kg",
                nomenclature: "Упаковка",
                series: "521411",
                quantity: 2350,
                unit: "кг",
                machine: "PR110",
                status: "Доступно",
                fr: "-",
            },
            {
                id: "i5",
                material: "SR00051 Sterilised+7 v1.5 kg",
                nomenclature: "Упаковка",
                series: "521411",
                quantity: 2350,
                unit: "кг",
                machine: "PR110",
                status: "Доступно",
                fr: "-",
            },
        ],
        releasedSeries: [
            {
                id: "r1",
                article: "110-F-5621",
                nomenclature: "S90989",
                rewind: true,
                series: "1979870001",
                netWeight: 1000,
                grossWeight: 1000,
                unit: "1000 пог. м",
                quantity: 10000,
                fr: "-",
                blocked: false,
            },
            {
                id: "r2",
                article: "110-F-5621",
                nomenclature: "S90989",
                rewind: false,
                series: "1979870001",
                netWeight: 1000,
                grossWeight: 1000,
                unit: "1000 пог. м",
                quantity: 10000,
                fr: "-",
                blocked: false,
            },
            {
                id: "r3",
                article: "110-F-5621",
                nomenclature: "S90989",
                rewind: false,
                series: "1979870001",
                netWeight: 1000,
                grossWeight: 1000,
                unit: "1000 пог. м",
                quantity: 10000,
                fr: "1-2025",
                blocked: true,
            },
            {
                id: "r4",
                article: "110-F-5621",
                nomenclature: "S90989",
                rewind: false,
                series: "1979870001",
                netWeight: 1000,
                grossWeight: 1000,
                unit: "1000 пог. м",
                quantity: 10000,
                fr: "-",
                blocked: false,
            },
            {
                id: "r5",
                article: "110-F-5621",
                nomenclature: "S90989",
                rewind: false,
                series: "1979870001",
                netWeight: 1000,
                grossWeight: 1000,
                unit: "1000 пог. м",
                quantity: 10000,
                fr: "-",
                blocked: false,
            },
        ],
        eventJournal: [
            {
                id: "e1",
                eventCode: "120 - Настройка",
                start: "15:00:00",
                end: "17:00:00",
                meterage: 500,
                details: [
                    { parameter: "Рулон", value: "0 - Рулон для брака" },
                    { parameter: "Начало, м", value: "0" },
                    { parameter: "Конец, м", value: "500" },
                    { parameter: "Статус", value: "Удален" },
                    { parameter: "Комментарий", value: "Необходимо взвесить в конце смены" },
                    { parameter: "Заезды на настройку", value: "0, A, B, C" },
                ],
            },
            { id: "e2", eventCode: "141 - Брызги краски", start: "11:00:00", end: "12:30:00", meterage: 3214 },
            { id: "e3", eventCode: "131 - Чистка; Устранение разлива", start: "13:00:00", end: "14:30:00", meterage: 5700 },
            { id: "e4", eventCode: "110 - Производство; Потеря скорости", start: "NULL", end: "NULL", meterage: 1200 },
        ],
        pendingEvents: [
            { id: "p1", signal: "Останов", start: "03-11-2028 12:00:00", end: "03-11-2028 12:30:00" },
            { id: "p2", signal: "Удар ножа", start: "03-11-2028 12:00:00", end: "03-11-2028 12:00:00" },
        ],
        totalEventMeterage: 11000,
        defectPercent: 20,
        hasSuspendedStageOnMachine: false,
        suspendedStageLabel: undefined,
    };

    if (machineId === "PR110") {
        return {
            ...base,
            hasSuspendedStageOnMachine: true,
            suspendedStageLabel: "Ламинация — этап 2 (приостановлен)",
        };
    }

    return base;
}
