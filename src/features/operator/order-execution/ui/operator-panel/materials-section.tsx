import { useState } from "react";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionMaterialsWriteoff } from "../order-execution-materials-writeoff";

type OrderExecutionMaterialsSectionProps = {
    workAreaId?: string;
};

export function OrderExecutionMaterialsSection({ workAreaId }: OrderExecutionMaterialsSectionProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <OrderExecutionCollapsibleSection
            title="Материалы. Списание/возврат"
            defaultOpen={false}
            tone="warning"
            keepMounted
            onExpandedChange={setExpanded}
        >
            <OrderExecutionMaterialsWriteoff workAreaId={workAreaId} enabled={expanded} />
        </OrderExecutionCollapsibleSection>
    );
}
