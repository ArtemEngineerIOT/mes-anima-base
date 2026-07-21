import { useState } from "react";

import { useRollWriteOffEventsSummary } from "../../model/materials-writeoff/raw-events-summary/use-roll-write-off-events-summary";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionMaterialsWriteoff } from "../order-execution-materials-writeoff";

type OrderExecutionMaterialsSectionProps = {
    workAreaId?: string;
    eventsSummaryEnabled: boolean;
    onMonitoringSummaryReload?: () => void;
};

export function OrderExecutionMaterialsSection({
    workAreaId,
    eventsSummaryEnabled,
    onMonitoringSummaryReload,
}: OrderExecutionMaterialsSectionProps) {
    const [expanded, setExpanded] = useState(false);
    const { totalCount } = useRollWriteOffEventsSummary({
        workAreaId,
        enabled: eventsSummaryEnabled,
    });

    const headerTone = totalCount > 0 ? "warning" : "success";

    return (
        <OrderExecutionCollapsibleSection
            title="Материалы. Списание/возврат"
            defaultOpen={false}
            tone={headerTone}
            count={totalCount > 0 ? totalCount : undefined}
            keepMounted
            onExpandedChange={setExpanded}
        >
            <OrderExecutionMaterialsWriteoff
                workAreaId={workAreaId}
                enabled={expanded}
                onMonitoringSummaryReload={onMonitoringSummaryReload}
            />
        </OrderExecutionCollapsibleSection>
    );
}
