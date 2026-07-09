import { useEffect } from "react";

import type { MonitoringTablesLoadOptions } from "./monitoring-tables-refresh";

/** Однократная загрузка при включении блока (интервальный polling отключён). */
export function useMonitoringTablesPoll(
    enabled: boolean,
    load: (options?: MonitoringTablesLoadOptions) => void | Promise<void>,
) {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        void load();
    }, [enabled, load]);
}
