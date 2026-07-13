import type { TechnologicalParamTagKey } from "./resolve-technological-param-stomp-value";
import type { TechnologicalParamHistoryEntry } from "./technological-params-history";
import type { MachineId } from "./types";

export type TechnologicalPrintingSectionRow = {
    id: string;
    sectionNumber: number;
    color: string;
    presserNo: string;
    standard: string;
    deviationPm: string;
    start: string;
    history: TechnologicalParamHistoryEntry[];
    /** Тег(и) STOMP `tags` — текущее значение (несколько — через «-»). */
    stompFieldKey?: TechnologicalParamTagKey;
    /** Тег(и) STOMP `tags` — уставка. */
    stompStandardFieldKey?: TechnologicalParamTagKey;
    fallbackCurrent: string;
    alert?: boolean;
};

export type TechnologicalProcessParamRow = {
    id: string;
    label: string;
    standard: string;
    deviationPm: string;
    start: string;
    history: TechnologicalParamHistoryEntry[];
    stompFieldKey?: TechnologicalParamTagKey;
    stompStandardFieldKey?: TechnologicalParamTagKey;
    fallbackCurrent: string;
    alert?: boolean;
};

export type TechnologicalSpeedRow = {
    id: string;
    label: string;
    standard: string;
    deviationPm: string;
    start: string;
    history: TechnologicalParamHistoryEntry[];
    stompFieldKey?: TechnologicalParamTagKey;
    stompStandardFieldKey?: TechnologicalParamTagKey;
    fallbackCurrent: string;
    alert?: boolean;
};

export type TechnologicalParamsSections = {
    presserWidth: string;
    printingTitle: string;
    printingSections: TechnologicalPrintingSectionRow[];
    unwindingTitle: string;
    unwinding: TechnologicalProcessParamRow[];
    windingTitle: string;
    winding: TechnologicalProcessParamRow[];
    speedTitle: string;
    speed: TechnologicalSpeedRow;
    rulesText: string;
};

const SAMPLE_HISTORY: TechnologicalParamHistoryEntry[] = [
    {
        value: "72",
        rollNumber: "002672230  1",
        checkedAt: "03-11-2028 10:00:00",
    },
    {
        value: "74",
        rollNumber: "002672230  1",
        checkedAt: "03-11-2028 11:00:00",
    },
    {
        value: "75",
        rollNumber: "002672230  1",
        checkedAt: "03-11-2028 12:00:00",
    },
];

/** Номера «печей» (hood) в тегах UNIT_{section}_HOOD_{n}_* по секциям из ответа STOMP. */
const PRINTING_SECTION_HOODS: Record<number, number[]> = {
    1: [1, 2],
    2: [1, 2],
    3: [1],
    4: [1],
    5: [1],
    6: [1],
    7: [1],
    8: [1],
    9: [1, 2],
    10: [1, 2, 3, 4],
};

function buildPrintingSection(
    sectionNumber: number,
    standard: string,
    color = "",
    presserNo = "",
): TechnologicalPrintingSectionRow {
    const hoods = PRINTING_SECTION_HOODS[sectionNumber] ?? [1];

    return {
        id: `printing-${sectionNumber}`,
        sectionNumber,
        color,
        presserNo,
        standard,
        deviationPm: "± 5",
        start: "03-11-2028 09:30:00",
        history: SAMPLE_HISTORY.map((entry) => ({ ...entry, value: standard })),
        stompStandardFieldKey: hoods.map((hood) => `UNIT_${sectionNumber}_HOOD_${hood}_SET_TEMP_`),
        stompFieldKey: hoods.map((hood) => `UNIT_${sectionNumber}_HOOD_${hood}_ACT_TEMP_`),
        fallbackCurrent: standard,
    };
}

const MOCK_LM230: TechnologicalParamsSections = {
    presserWidth: "",
    printingTitle: "Настройки печатных секций",
    printingSections: [
        ...Array.from({ length: 7 }, (_, index) => buildPrintingSection(index + 1, "75")),
        buildPrintingSection(8, "105"),
        buildPrintingSection(9, "100-100"),
        buildPrintingSection(10, ""),
    ],
    unwindingTitle: "Настройки размотки 1",
    unwinding: [
        {
            id: "unwinding-roll-tension",
            label: "Натяжение рулона:",
            standard: "10",
            deviationPm: "± 1",
            start: "03-11-2028 09:30:00",
            history: SAMPLE_HISTORY,
            stompStandardFieldKey: "UNW_SET_TENSION_MIS",
            stompFieldKey: "UNW_ACT_TENSION_L_C_",
            fallbackCurrent: "10",
        },
        {
            id: "unwinding-drawing-group",
            label: "Тянущая группа:",
            standard: "16",
            deviationPm: "± 1",
            start: "03-11-2028 09:30:00",
            history: SAMPLE_HISTORY.map((entry) => ({ ...entry, value: "16" })),
            stompStandardFieldKey: "ENTRY_DRAW_GROUP_SET_TENSION_MIS",
            stompFieldKey: "PRINTING_UNIT_INLET_ACT_TENSION_L_C_",
            fallbackCurrent: "16",
        },
        {
            id: "unwinding-coronator",
            label: "Коронатор:",
            standard: "—",
            deviationPm: "—",
            start: "—",
            history: [],
            stompFieldKey: "UNW_CORONA_CONTACTOR",
            fallbackCurrent: "—",
        },
    ],
    windingTitle: "Настройки намотки",
    winding: [
        {
            id: "winding-upper-group",
            label: "Верхняя группа:",
            standard: "—",
            deviationPm: "± 1",
            start: "—",
            history: [],
            fallbackCurrent: "—",
        },
        {
            id: "winding-roll-tension",
            label: "Натяжение рулона:",
            standard: "10",
            deviationPm: "—",
            start: "03-11-2028 09:30:00",
            history: SAMPLE_HISTORY,
            stompStandardFieldKey: "REW_SET_TENSION_MIS",
            stompFieldKey: "REW_ACT_TENSION_CALCULATED",
            fallbackCurrent: "10",
        },
        {
            id: "winding-drawing-group",
            label: "Тянущая группа:",
            standard: "10",
            deviationPm: "± 1",
            start: "03-11-2028 09:30:00",
            history: SAMPLE_HISTORY,
            stompStandardFieldKey: "REW_DRAW_GROUP_SET_TENSION_MIS",
            stompFieldKey: "REW_INLET_ACT_TENSION_L_C_",
            fallbackCurrent: "10",
        },
        {
            id: "winding-tension-drop",
            label: "Спад натяжения, %:",
            standard: "70",
            deviationPm: "—",
            start: "03-11-2028 09:30:00",
            history: SAMPLE_HISTORY.map((entry) => ({ ...entry, value: "70" })),
            stompStandardFieldKey: "REW_SET_TAPER_TENSION",
            fallbackCurrent: "70",
        },
    ],
    speedTitle: "Скорость",
    speed: {
        id: "print-speed",
        label: "Скорость печати:",
        standard: "350",
        deviationPm: "—",
        start: "03-11-2028 09:30:00",
        history: SAMPLE_HISTORY.map((entry) => ({ ...entry, value: "348" })),
        stompStandardFieldKey: "MAIN_MOTOR_SET_SPEED",
        stompFieldKey: "MAIN_MOTOR_CALC_SPEED_MIS",
        fallbackCurrent: "348",
    },
    rulesText:
        "Производить контроль и фиксацию параметров на каждом СТАРТЕ (при настройке и после длительных остановок более 1,5 часа). Периодичность заполнения карты контроля параметров печати — каждые 2 часа, но не реже, чем 1 раз на проект.",
};

export function getTechnologicalParamsMock(machineId: MachineId): TechnologicalParamsSections {
    switch (machineId) {
        case "LM230":
        case "PR110":
        case "PR120":
        default:
            return MOCK_LM230;
    }
}

export function collectTechnologicalParamRowIds(data: TechnologicalParamsSections): string[] {
    return [
        ...data.printingSections.map((row) => row.id),
        ...data.unwinding.map((row) => row.id),
        ...data.winding.map((row) => row.id),
        data.speed.id,
    ];
}

export function buildInitialTechnologicalParamHistory(
    data: TechnologicalParamsSections,
): Record<string, TechnologicalParamHistoryEntry[]> {
    const entries: Record<string, TechnologicalParamHistoryEntry[]> = {};

    for (const row of data.printingSections) {
        entries[row.id] = row.history.map((entry) => ({ ...entry }));
    }
    for (const row of data.unwinding) {
        entries[row.id] = row.history.map((entry) => ({ ...entry }));
    }
    for (const row of data.winding) {
        entries[row.id] = row.history.map((entry) => ({ ...entry }));
    }
    entries[data.speed.id] = data.speed.history.map((entry) => ({ ...entry }));

    return entries;
}
