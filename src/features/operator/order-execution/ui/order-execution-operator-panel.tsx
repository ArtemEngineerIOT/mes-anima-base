import { useState } from "react";

import type { MachineData, MachineId } from "../model/types";
import { EventRegistrationProvider } from "../model/event-registration/event-registration-context";
import {
    OrderExecutionEventRegistrationSection,
    OrderExecutionJbSection,
    OrderExecutionMaterialsSection,
    OrderExecutionProcessControlSection,
    OrderExecutionProcessJournalSection,
    OrderExecutionReleaseSection,
    OrderExecutionStageCompletionSection,
} from "./operator-panel";

type OrderExecutionOperatorPanelProps = {
    operator: MachineData["operator"];
    machineId: MachineId;
    workAreaId?: string;
    onMonitoringSummaryReload?: () => void;
    onReleaseProductionEventsSummaryChanged?: () => void;
};

export function OrderExecutionOperatorPanel({
    operator,
    machineId,
    workAreaId,
    onMonitoringSummaryReload,
    onReleaseProductionEventsSummaryChanged,
}: OrderExecutionOperatorPanelProps) {
    const [eventRegistrationExpanded, setEventRegistrationExpanded] = useState(false);
    const [processJournalExpanded, setProcessJournalExpanded] = useState(false);

    return (
        <EventRegistrationProvider
            machineId={machineId}
            workAreaId={workAreaId}
            enabled={eventRegistrationExpanded}
            journalEnabled={processJournalExpanded}
        >
            <div className="min-h-0 flex flex-col gap-3 app-scroll overflow-auto">
                <OrderExecutionJbSection jb={operator.jb} workAreaId={workAreaId} />
                
                <OrderExecutionMaterialsSection
                    workAreaId={workAreaId}
                    eventsSummaryEnabled={Boolean(workAreaId?.trim())}
                    onMonitoringSummaryReload={onMonitoringSummaryReload}
                />
                <OrderExecutionProcessControlSection workAreaId={workAreaId} />
                <OrderExecutionProcessJournalSection onExpandedChange={setProcessJournalExpanded} />
                <OrderExecutionEventRegistrationSection
                    workAreaId={workAreaId}
                    signalsSummaryEnabled={Boolean(workAreaId?.trim())}
                    onExpandedChange={setEventRegistrationExpanded}
                />
                <OrderExecutionReleaseSection
                    workAreaId={workAreaId}
                    eventsSummaryEnabled={Boolean(workAreaId?.trim())}
                    onRelatedDataReload={onReleaseProductionEventsSummaryChanged}
                />

                <OrderExecutionStageCompletionSection workAreaId={workAreaId} />
            </div>
        </EventRegistrationProvider>
    );
}
