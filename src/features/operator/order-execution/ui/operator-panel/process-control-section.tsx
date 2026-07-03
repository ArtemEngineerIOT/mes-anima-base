import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionProcessControl } from "../order-execution-process-control";

export function OrderExecutionProcessControlSection() {
    return (
        <OrderExecutionCollapsibleSection title="Контроль процесса" defaultOpen={false} tone="system" keepMounted>
            <OrderExecutionProcessControl />
        </OrderExecutionCollapsibleSection>
    );
}
