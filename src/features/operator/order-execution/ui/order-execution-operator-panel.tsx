import { useState } from "react";

import type { MachineData, MachineId } from "../model/types";
import type { ReleaseProductionEventsSummarySnapshot } from "../model/release/production-events-summary/types";
import type { RollWriteOffEventsSummarySnapshot } from "../model/materials-writeoff/raw-events-summary/types";
import type { UnprocessedSignalsSummarySnapshot } from "../model/event-registration/unprocessed-signals-summary/types";
import type { StageCompletionReadinessSnapshot } from "../model/stage-completion-readiness/types";
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
    stageCompletionBlockSummary?: StageCompletionReadinessSnapshot | null;
    onMonitoringSummaryReload?: () => void;
    /** После успешного registerRelease — silent-reload мониторинга / прогресса */
    onReleaseRegistered?: () => void;
};

export function OrderExecutionOperatorPanel({
    operator: _operator,
    machineId,
    workAreaId,
    workAreaStart,
    order,
    releaseBlockSummary,
    writeOffBlockSummary,
    machineSignalsBlockSummary,
    stageCompletionBlockSummary,
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
            onMonitoringSummaryReload={onMonitoringSummaryReload}
        >
            <div className="app-scroll flex h-full min-h-0 flex-col gap-3 overflow-auto overscroll-contain [overflow-anchor:none]">
                <OrderExecutionJbSection
                    machineId={machineId}
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

                <OrderExecutionStageCompletionSection
                    workAreaId={workAreaId}
                    initialReadiness={stageCompletionBlockSummary}
                    readinessEnabled={Boolean(workAreaId?.trim())}
                />
            </div>
        </EventRegistrationProvider>
    );
}
