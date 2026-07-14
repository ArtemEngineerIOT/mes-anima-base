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
};

export function OrderExecutionOperatorPanel({
    operator,
    machineId,
    workAreaId,
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
                
                <OrderExecutionMaterialsSection workAreaId={workAreaId} />
                <OrderExecutionProcessControlSection />
                <OrderExecutionProcessJournalSection onExpandedChange={setProcessJournalExpanded} />
                <OrderExecutionEventRegistrationSection onExpandedChange={setEventRegistrationExpanded} />
                <OrderExecutionReleaseSection workAreaId={workAreaId} />

                <OrderExecutionStageCompletionSection machineId={machineId} />
            </div>
        </EventRegistrationProvider>
    );
}
