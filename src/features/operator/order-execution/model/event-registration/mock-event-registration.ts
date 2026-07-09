import type { MachineId } from "../types";
import type { EventRegistrationSnapshot, SetupRunTag } from "./types";

const SETUP_RUN_TAGS: SetupRunTag[] = [
    { tag: "Zerropull", label: "0 — Zerropull" },
    { tag: "A", label: "A" },
    { tag: "B", label: "B" },
    { tag: "C", label: "C" },
    { tag: "D", label: "D" },
    { tag: "E", label: "E" },
];

const EVENT_CODES: EventRegistrationSnapshot["eventCodes"] = [
    { code: 117, label: "Устранение розлива", requiresTime: true, requiresMeterage: false, requiresComment: true },
    {
        code: 120,
        label: "Настройка",
        requiresTime: true,
        requiresMeterage: true,
        requiresComment: false,
        requiresSetupRuns: true,
    },
    { code: 121, label: "Тонирование", requiresTime: true, requiresMeterage: true, requiresComment: true },
    { code: 141, label: "Брызги краски", requiresTime: true, requiresMeterage: true, requiresComment: false },
    { code: 113, label: "Плановое ТО", requiresTime: true, requiresMeterage: false, requiresComment: false },
];

const baseRollCatalog: EventRegistrationSnapshot["rollCatalog"] = [
    { ref: "0", label: "0 — рулон для брака" },
    { ref: "PR1", label: "PR1" },
    { ref: "PR2", label: "PR2" },
    { ref: "PR3", label: "PR3" },
];

const baseCardColorCatalog: EventRegistrationSnapshot["cardColorCatalog"] = [
    { code: "BLUE", label: "Синяя" },
    { code: "YELLOW", label: "Жёлтая" },
    { code: "GREEN", label: "Зелёная" },
    { code: "RED", label: "Красная" },
];

const baseSnapshot: Omit<EventRegistrationSnapshot, "unprocessedEvents" | "initialJournal"> = {
    eventCodes: EVENT_CODES,
    setupRunTags: SETUP_RUN_TAGS,
    rollOptions: baseRollCatalog.map((item) => item.label),
    rollCatalog: baseRollCatalog,
    scrapRollDefault: "0 — рулон для брака",
    activeRollDefault: "PR1",
    lineCount: 12,
    lineNumberOptions: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    sideOptions: ["PM", "Passer"],
    sideDefault: "PM",
    cardColorOptions: baseCardColorCatalog.map((item) => item.label),
    cardColorCatalog: baseCardColorCatalog,
};

const pr120Snapshot: EventRegistrationSnapshot = {
    ...baseSnapshot,
    unprocessedEvents: [
        {
            id: "ue-1",
            detectedAt: "03-11-2028 10:15:00",
            endedAt: "03-11-2028 10:15:12",
            signalType: "knife",
            description: "Удар ножа",
            meterFrom: "1240",
            meterTo: "1245",
        },
        {
            id: "ue-2",
            detectedAt: "03-11-2028 10:10:00",
            endedAt: "03-11-2028 10:10:08",
            signalType: "knife",
            description: "Удар ножа",
            meterFrom: "1180",
            meterTo: "1185",
        },
    ],
    initialJournal: [
        {
            id: "j-1",
            eventCodeLabel: "120 — Настройка",
            timeStart: "08:00:00",
            timeEnd: "08:25:00",
            lengthM: "500",
            details: [
                { parameter: "Заезды на настройку", value: "0 — Zerropull, A" },
                { parameter: "Рулон", value: "0 — рулон для брака" },
                { parameter: "Комментарий", value: "Первый заезд" },
                { parameter: "Статус", value: "Удален" },
            ],
        },
    ],
};

const lm230Snapshot: EventRegistrationSnapshot = {
    ...baseSnapshot,
    unprocessedEvents: [],
    initialJournal: [],
};

const pr110Snapshot: EventRegistrationSnapshot = {
    ...pr120Snapshot,
    unprocessedEvents: [],
};

export function getEventRegistrationSnapshot(machineId: MachineId): EventRegistrationSnapshot {
    switch (machineId) {
        case "LM230":
            return lm230Snapshot;
        case "PR110":
            return pr110Snapshot;
        default:
            return pr120Snapshot;
    }
}
