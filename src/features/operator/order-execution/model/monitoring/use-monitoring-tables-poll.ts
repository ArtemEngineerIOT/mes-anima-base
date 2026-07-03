import { useEffect } from "react";

import {
    MONITORING_TABLES_REFRESH_INTERVAL_MS,
    type MonitoringTablesLoadOptions,
} from "./monitoring-tables-refresh";

export function useMonitoringTablesPoll(
    enabled: boolean,
    load: (options?: MonitoringTablesLoadOptions) => void | Promise<void>,
) {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        void load();

        const intervalId = window.setInterval(() => {
            void load({ silent: true });
        }, MONITORING_TABLES_REFRESH_INTERVAL_MS);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [enabled, load]);
}
