import { useState } from "react";

import type { MachineData, MachineId } from "../model/types";
import type { ReleaseProductionEventsSummarySnapshot } from "../model/release/production-events-summary/types";
import type { RollWriteOffEventsSummarySnapshot } from "../model/materials-writeoff/raw-events-summary/types";
import type { UnprocessedSignalsSummarySnapshot } from "../model/event-registration/unprocessed-signals-summary/types";
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
    workAreaStart?: string;
    order?: string;
    releaseBlockSummary?: ReleaseProductionEventsSummarySnapshot | null;
    writeOffBlockSummary?: RollWriteOffEventsSummarySnapshot | null;
    machineSignalsBlockSummary?: UnprocessedSignalsSummarySnapshot | null;
    onMonitoringSummaryReload?: () => void;
    /** После успешного registerRelease — silent-reload мониторинга / прогресса */
    onReleaseRegistered?: () => void;
};

export function OrderExecutionOperatorPanel({
    operator,
    machineId,
    workAreaId,
    workAreaStart,
    order,
    releaseBlockSummary,
    writeOffBlockSummary,
    machineSignalsBlockSummary,
    onMonitoringSummaryReload,
    onReleaseRegistered,
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
                <OrderExecutionJbSection
                    jb={operator.jb}
                    workAreaId={workAreaId}
                    workAreaStart={workAreaStart}
                    order={order}
                />
                
                <OrderExecutionMaterialsSection
                    workAreaId={workAreaId}
                    initialWriteOffSummary={writeOffBlockSummary}
                    eventsSummaryEnabled={Boolean(workAreaId?.trim())}
                    onMonitoringSummaryReload={onMonitoringSummaryReload}
                />
                <OrderExecutionProcessControlSection workAreaId={workAreaId} />
                <OrderExecutionProcessJournalSection onExpandedChange={setProcessJournalExpanded} />
                <OrderExecutionEventRegistrationSection
                    workAreaId={workAreaId}
                    initialMachineSignalsSummary={machineSignalsBlockSummary}
                    signalsSummaryEnabled={Boolean(workAreaId?.trim())}
                    onExpandedChange={setEventRegistrationExpanded}
                />
                <OrderExecutionReleaseSection
                    workAreaId={workAreaId}
                    initialReleaseSummary={releaseBlockSummary}
                    eventsSummaryEnabled={Boolean(workAreaId?.trim())}
                    onReleaseRegistered={onReleaseRegistered}
                />

                <OrderExecutionStageCompletionSection workAreaId={workAreaId} />
            </div>
        </EventRegistrationProvider>
    );
}
