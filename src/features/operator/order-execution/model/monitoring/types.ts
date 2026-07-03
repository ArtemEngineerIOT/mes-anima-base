export type MonitoringLineMeters = {
    inLine: { totalM: number; rollInM: number };
    outLine: { totalM: number; rollOutM: number };
};

export const MONITORING_EMPTY_LINE_METERS: MonitoringLineMeters = {
    inLine: { totalM: 0, rollInM: 0 },
    outLine: { totalM: 0, rollOutM: 0 },
};

export type MonitoringInputRollRow = {
    roll: string;
    lengthM: number;
};

export type MonitoringOutputRollRow = {
    roll: string;
    lengthM: number;
    composition?: string;
    reason?: string;
    blocked?: boolean;
};

export type MonitoringRollTables = {
    inputRolls: MonitoringInputRollRow[];
    outputRolls: MonitoringOutputRollRow[];
};

export const MONITORING_EMPTY_ROLL_TABLES: MonitoringRollTables = {
    inputRolls: [],
    outputRolls: [],
};

/** Лимит превью таблиц рулонов (BFF `preview_limit`, UI-00d). */
export const MONITORING_ROLL_TABLES_PREVIEW_LIMIT = "3";

export type MonitoringStageEventRow = {
    label: string;
    uom: string;
    quantity: number;
};

export const MONITORING_EMPTY_STAGE_EVENTS: MonitoringStageEventRow[] = [];
