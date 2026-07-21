import { useState } from "react";

import { useProductionEventsSummary } from "../../model/release/production-events-summary/use-production-events-summary";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionRelease } from "../order-execution-release";

type OrderExecutionReleaseSectionProps = {
    workAreaId?: string;
    eventsSummaryEnabled: boolean;
    onRelatedDataReload?: () => void;
};

export function OrderExecutionReleaseSection({
    workAreaId,
    eventsSummaryEnabled,
    onRelatedDataReload,
}: OrderExecutionReleaseSectionProps) {
    const [expanded, setExpanded] = useState(false);
    const { totalCount } = useProductionEventsSummary({
        workAreaId,
        enabled: eventsSummaryEnabled,
        onRelatedDataReload,
    });

    const headerTone = totalCount > 0 ? "warning" : "success";

    return (
        <OrderExecutionCollapsibleSection
            title="Выпуск"
            defaultOpen={false}
            tone={headerTone}
            count={totalCount > 0 ? totalCount : undefined}
            keepMounted
            onExpandedChange={setExpanded}
        >
            <OrderExecutionRelease workAreaId={workAreaId} enabled={expanded} />
        </OrderExecutionCollapsibleSection>
    );
}
