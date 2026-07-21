import { useMemo } from "react";

import { Informer } from "@/shared/ui/kit/informer";
import { MachineDataPanel } from "@/shared/ui/kit/machine-data-panel";

import type { UnprocessedSignalsSummarySnapshot } from "../../../model/event-registration/unprocessed-signals-summary/types";
import { toUnprocessedSignalsSummaryPanelRows } from "../../../model/event-registration/unprocessed-signals-summary/map-unprocessed-signals-summary-payload";

type EventRegistrationSignalsSummaryPanelProps = {
    snapshot: UnprocessedSignalsSummarySnapshot;
    isLoading: boolean;
    error: string | null;
};

export function EventRegistrationSignalsSummaryPanel({
    snapshot,
    isLoading,
    error,
}: EventRegistrationSignalsSummaryPanelProps) {
    const rows = useMemo(() => {
        if (isLoading && snapshot.summaryRows.length === 0) {
            return [{ characteristic: "Загрузка…", value: "…", unit: "" }];
        }
        return toUnprocessedSignalsSummaryPanelRows(snapshot);
    }, [isLoading, snapshot]);

    if (error) {
        return (
            <Informer
                tone="alert"
                variant="bordered"
                size="s"
                title="Сигналы с машины"
                description={error}
            />
        );
    }

    return (
        <MachineDataPanel
            title="Сигналы с машины"
            rows={rows}
            tone={snapshot.totalCount > 0 ? "warning" : "success"}
            updatedAt={snapshot.lastEventAt || null}
            updatedAtLabel="Обновлено"
            emptyText="Нет необработанных сигналов"
        />
    );
}
