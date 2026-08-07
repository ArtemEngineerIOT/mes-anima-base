import { useEffect, useRef, useState } from "react";

import type { RollWriteOffEventsSummarySnapshot } from "../../model/materials-writeoff/raw-events-summary/types";
import { useRollWriteOffEventsSummary } from "../../model/materials-writeoff/raw-events-summary/use-roll-write-off-events-summary";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionMaterialsWriteoff } from "../order-execution-materials-writeoff";

const MATERIAL_SIGNALS_SILENT_RELOAD_DEBOUNCE_MS = 300;

type OrderExecutionMaterialsSectionProps = {
    workAreaId?: string;
    initialWriteOffSummary?: RollWriteOffEventsSummarySnapshot | null;
    eventsSummaryEnabled: boolean;
    onMonitoringSummaryReload?: () => void;
};

export function OrderExecutionMaterialsSection({
    workAreaId,
    initialWriteOffSummary = null,
    eventsSummaryEnabled,
    onMonitoringSummaryReload,
}: OrderExecutionMaterialsSectionProps) {
    const [expanded, setExpanded] = useState(false);
    const materialSignalsSilentReloadRef = useRef<(() => void) | null>(null);
    const silentReloadDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (silentReloadDebounceTimerRef.current !== null) {
                clearTimeout(silentReloadDebounceTimerRef.current);
            }
        };
    }, []);

    const { snapshot, unprocessedCount } = useRollWriteOffEventsSummary({
        workAreaId,
        initialSnapshot: initialWriteOffSummary,
        enabled: eventsSummaryEnabled,
        onSummaryChanged: () => {
            if (silentReloadDebounceTimerRef.current !== null) {
                clearTimeout(silentReloadDebounceTimerRef.current);
            }

            silentReloadDebounceTimerRef.current = setTimeout(() => {
                materialSignalsSilentReloadRef.current?.();
            }, MATERIAL_SIGNALS_SILENT_RELOAD_DEBOUNCE_MS);
        },
    });

    const headerTone = unprocessedCount > 0 ? "warning" : "success";

    return (
        <OrderExecutionCollapsibleSection
            title="Материалы. Списание/возврат"
            defaultOpen={false}
            tone={headerTone}
            count={unprocessedCount > 0 ? unprocessedCount : undefined}
            keepMounted
            onExpandedChange={setExpanded}
        >
            <OrderExecutionMaterialsWriteoff
                workAreaId={workAreaId}
                enabled={expanded}
                eventsSummary={snapshot}
                onMonitoringSummaryReload={onMonitoringSummaryReload}
                materialSignalsSilentReloadRef={materialSignalsSilentReloadRef}
            />
        </OrderExecutionCollapsibleSection>
    );
}
