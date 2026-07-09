import type { MachineId } from "../types";

/** Тег заезда на настройку (зеропул) */
export type SetupRunTag = {
    tag: string;
    label: string;
};

/** Справочник кодов событий (время / метраж / комментарий — обязательность) */
export type EventCodeDefinition = {
    code: number;
    label: string;
    requiresTime: boolean;
    requiresMeterage: boolean;
    requiresComment: boolean;
    /** Код 120 и др.: на шаге 2 показывать «Заезды на настройку» */
    requiresSetupRuns?: boolean;
};

export type EventRegistrationStep = 1 | 2 | 3;

export type ScrapRemovalMode = "immediate" | "deferred";

export type EventSide = "PM" | "Passer";

export type EventRollCatalogItem = {
    ref: string;
    label: string;
};

export type EventCardColorCatalogItem = {
    code: string;
    label: string;
};

/** Черновик пошаговой формы регистрации события */
export type EventRegistrationDraft = {
    eventCode: number | null;
    setupRuns: string[];
    removeScrapImmediately: boolean | null;
    meterFrom: string;
    meterTo: string;
    timeFrom: string;
    timeTo: string;
    wholeStage: boolean;
    roll: string;
    comment: string;
    side: EventSide | "";
    selectedLines: string[];
    startCard: string;
    endCard: string;
};

/** Сигнал с машины, ожидающий классификации */
export type UnprocessedMachineEvent = {
    id: string;
    detectedAt: string;
    endedAt: string;
    signalType: "stop" | "knife" | "other";
    description: string;
    /** Метраж на начало сигнала (с датчика), если известен */
    meterFrom?: string;
    /** Метраж на завершение сигнала (с датчика), если известен */
    meterTo?: string;
};

/** Детальная строка раскрытия записи журнала процесса */
export type ProcessJournalDetailRow = {
    parameter: string;
    value: string;
};

/** Запись журнала процесса этапа */
export type ProcessJournalEntry = {
    id: string;
    eventCodeLabel: string;
    timeStart: string;
    timeEnd: string;
    lengthM: string;
    details?: ProcessJournalDetailRow[];
};

export type EventRegistrationSnapshot = {
    eventCodes: EventCodeDefinition[];
    setupRunTags: SetupRunTag[];
    unprocessedEvents: UnprocessedMachineEvent[];
    rollOptions: string[];
    rollCatalog: EventRollCatalogItem[];
    scrapRollDefault: string;
    activeRollDefault: string;
    lineCount: number;
    lineNumberOptions: string[];
    sideOptions: EventSide[];
    /** Значение для поля «Сторона» по умолчанию (defaults.side на BFF) */
    sideDefault: EventSide;
    cardColorOptions: string[];
    cardColorCatalog: EventCardColorCatalogItem[];
    initialJournal: ProcessJournalEntry[];
};

export type EventRegistrationContext = {
    machineId: MachineId;
    snapshot: EventRegistrationSnapshot;
};
