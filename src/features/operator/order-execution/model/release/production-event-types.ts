export type ReleaseProductionEventDisplayRow = {
    characteristic: string;
    value: string;
    unit: string;
};

export type ReleaseProductionCurrentEvent = {
    machineEventSignalId: string;
    eventCode: string;
    eventCodeLabel: string;
    eventAt: string;
    informerDetail: string;
    registerAction: string;
    displayRows: ReleaseProductionEventDisplayRow[];
};

export type ReleaseProductionEventColumn = {
    key: string;
    label: string;
};

export type ReleaseProductionEventListRow = {
    id: string;
    values: Record<string, string | number | null>;
};

export type ReleaseProductionEventSnapshot = {
    workAreaId: string;
    plateTitle: string;
    pendingCount: number;
    manualReleaseBlocked: boolean;
    emptyStateMessage: string;
    currentEvent: ReleaseProductionCurrentEvent | null;
    eventList: ReleaseProductionEventListRow[];
    eventColumns: ReleaseProductionEventColumn[];
};

export const RELEASE_PRODUCTION_EVENT_DEFAULT_COLUMNS: ReleaseProductionEventColumn[] = [
    { key: "signal_id", label: "ID" },
    { key: "event_description", label: "Имя" },
    { key: "registered_at", label: "Время" },
    { key: "length_m", label: "Длина, м" },
    { key: "event_name", label: "Код события" },
];

/** Колонки таблицы «Сигналы машины (выпуск)» на UI. */
export const RELEASE_PRODUCTION_EVENT_VISIBLE_COLUMNS: ReleaseProductionEventColumn[] = [
    { key: "event_description", label: "Наименование" },
    { key: "registered_at", label: "Время" },
    { key: "length_m", label: "Длина" },
];

export const RELEASE_EMPTY_PRODUCTION_EVENT: ReleaseProductionEventSnapshot = {
    workAreaId: "",
    plateTitle: "Событие с машины",
    pendingCount: 0,
    manualReleaseBlocked: false,
    emptyStateMessage: "",
    currentEvent: null,
    eventList: [],
    eventColumns: RELEASE_PRODUCTION_EVENT_DEFAULT_COLUMNS,
};
