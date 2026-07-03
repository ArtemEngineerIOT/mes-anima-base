import type { MachineId } from "../types";

/** Справочник кодов событий (время / метраж / комментарий — обязательность) */
export type EventCodeDefinition = {
    code: number;
    label: string;
    requiresTime: boolean;
    requiresMeterage: boolean;
    requiresComment: boolean;
    /** Подкоды (зеропулы), например код 120 */
    subCodes?: string[];
};

export type EventRegistrationStep = 1 | 2 | 3;

export type ScrapRemovalMode = "immediate" | "deferred";

export type EventSide = "PM" | "Passer";

/** Черновик пошаговой формы регистрации события */
export type EventRegistrationDraft = {
    eventCode: number | null;
    subCode: string;
    removeScrapImmediately: boolean | null;
    meterFrom: string;
    meterTo: string;
    timeFrom: string;
    timeTo: string;
    wholeStage: boolean;
    roll: string;
    comment: string;
    side: EventSide | "";
    lineNumbers: string;
    startCard: string;
    endCard: string;
};

/** Сигнал с машины, ожидающий классификации */
export type UnprocessedMachineEvent = {
    id: string;
    detectedAt: string;
    signalType: "stop" | "knife" | "other";
    description: string;
};

/** Запись журнала процесса этапа */
export type ProcessJournalEntry = {
    id: string;
    registeredAt: string;
    eventCode: number;
    eventCodeLabel: string;
    subCode?: string;
    removeScrapImmediately: boolean;
    startSummary: string;
    endSummary: string;
    meterageSummary: string;
    details: Record<string, string>;
};

export type EventMachineTelemetry = {
    stopsCount: number;
    knifeHitsCount: number;
    speedValue: string;
    speedUnit: string;
};

export type EventRegistrationSnapshot = {
    eventCodes: EventCodeDefinition[];
    telemetry: EventMachineTelemetry;
    unprocessedEvents: UnprocessedMachineEvent[];
    rollOptions: string[];
    scrapRollDefault: string;
    activeRollDefault: string;
    lineCount: number;
    sideOptions: EventSide[];
    cardColorOptions: string[];
    initialJournal: ProcessJournalEntry[];
};

export type EventRegistrationContext = {
    machineId: MachineId;
    snapshot: EventRegistrationSnapshot;
};
