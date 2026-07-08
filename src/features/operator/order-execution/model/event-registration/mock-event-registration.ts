import type { MachineId } from "../types";
import type { EventRegistrationSnapshot } from "./types";

const EVENT_CODES: EventRegistrationSnapshot["eventCodes"] = [
    { code: 117, label: "Устранение розлива", requiresTime: true, requiresMeterage: false, requiresComment: true },
    { code: 120, label: "Настройка", requiresTime: true, requiresMeterage: true, requiresComment: false, subCodes: ["A", "B", "C", "D", "E"] },
    { code: 121, label: "Тонирование", requiresTime: true, requiresMeterage: true, requiresComment: true },
    { code: 141, label: "Брызги краски", requiresTime: true, requiresMeterage: true, requiresComment: false },
    { code: 113, label: "Плановое ТО", requiresTime: true, requiresMeterage: false, requiresComment: false },
];

const baseSnapshot: Omit<EventRegistrationSnapshot, "telemetry" | "unprocessedEvents" | "initialJournal"> = {
    eventCodes: EVENT_CODES,
    rollOptions: ["0 — рулон для брака", "PR1", "PR2", "PR3"],
    scrapRollDefault: "0 — рулон для брака",
    activeRollDefault: "PR1",
    lineCount: 12,
    sideOptions: ["PM", "Passer"],
    cardColorOptions: ["Синяя", "Жёлтая", "Зелёная", "Красная"],
};

const pr120Snapshot: EventRegistrationSnapshot = {
    ...baseSnapshot,
    telemetry: { stopsCount: 3, knifeHitsCount: 12, speedValue: "300", speedUnit: "м / мин." },
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
            registeredAt: "11-06-2026 08:30:00",
            eventCode: 120,
            eventCodeLabel: "120 — Настройка",
            subCode: "A",
            removeScrapImmediately: true,
            startSummary: "0 м",
            endSummary: "500 м",
            meterageSummary: "0 — 500",
            details: {
                "Время": "08:00 — 08:25",
                "Рулон": "0 — рулон для брака",
                "Комментарий": "Первый заезд",
            },
        },
    ],
};

const lm230Snapshot: EventRegistrationSnapshot = {
    ...baseSnapshot,
    telemetry: { stopsCount: 1, knifeHitsCount: 4, speedValue: "180", speedUnit: "м / мин." },
    unprocessedEvents: [],
    initialJournal: [],
};

const pr110Snapshot: EventRegistrationSnapshot = {
    ...pr120Snapshot,
    telemetry: { stopsCount: 0, knifeHitsCount: 2, speedValue: "250", speedUnit: "м / мин." },
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
