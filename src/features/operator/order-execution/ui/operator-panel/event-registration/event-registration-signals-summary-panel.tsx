import { useMemo } from "react";

import { Informer } from "@/shared/ui/kit/informer";
import { MachineDataPanel } from "@/shared/ui/kit/machine-data-panel";

import type { UnprocessedSignalsSummarySnapshot } from "../../../model/event-registration/unprocessed-signals-summary/types";
import { toUnprocessedSignalsSummaryPanelRows } from "../../../model/event-registration/unprocessed-signals-summary/map-unprocessed-signals-summary-payload";
import { useOrderExecutionMachineStompState } from "../../../model/machine-stomp/order-execution-machine-stomp-context";
import { resolveMachineStompPanelTone } from "../../../model/machine-stomp/resolve-machine-stomp-panel-tone";

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
    const machineStompState = useOrderExecutionMachineStompState();
    const panelTone = resolveMachineStompPanelTone(machineStompState);

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
                title="Данные с машин"
                description={error}
            />
        );
    }

    return (
        <MachineDataPanel
            title="Данные с машин"
            rows={rows}
            tone={panelTone}
            updatedAt={snapshot.changedAt || snapshot.lastEventAt || null}
            updatedAtLabel="Обновлено"
            emptyText="Нет необработанных сигналов"
        />
    );
}
