import { useState } from "react";

import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionRelease } from "../order-execution-release";

type OrderExecutionReleaseSectionProps = {
    workAreaId?: string;
};

export function OrderExecutionReleaseSection({ workAreaId }: OrderExecutionReleaseSectionProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <OrderExecutionCollapsibleSection
            title="Выпуск"
            defaultOpen={false}
            tone="success"
            keepMounted
            onExpandedChange={setExpanded}
        >
            <OrderExecutionRelease workAreaId={workAreaId} enabled={expanded} />
        </OrderExecutionCollapsibleSection>
    );
}
