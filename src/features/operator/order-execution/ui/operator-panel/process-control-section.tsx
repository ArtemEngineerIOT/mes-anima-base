import { useState } from "react";

import { useProcessControl } from "../../model/process-control/use-process-control";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionProcessControl } from "../order-execution-process-control";

type OrderExecutionProcessControlSectionProps = {
    workAreaId?: string;
};

export function OrderExecutionProcessControlSection({ workAreaId }: OrderExecutionProcessControlSectionProps) {
    const [expanded, setExpanded] = useState(false);
    const processControl = useProcessControl({
        workAreaId,
        enabled: expanded && Boolean(workAreaId?.trim()),
    });

    return (
        <OrderExecutionCollapsibleSection
            title="Контроль процесса"
            defaultOpen={false}
            keepMounted
            updatedAt={processControl.updatedAt || null}
            updatedAtLabel="Обновлено"
            onExpandedChange={setExpanded}
        >
            <OrderExecutionProcessControl {...processControl} workAreaId={workAreaId} />
        </OrderExecutionCollapsibleSection>
    );
}
