/** Временный интервал опроса таблиц мониторинга (мс). */
export const MONITORING_TABLES_REFRESH_INTERVAL_MS = 5_000;

export type MonitoringTablesLoadOptions = {
    silent?: boolean;
};
