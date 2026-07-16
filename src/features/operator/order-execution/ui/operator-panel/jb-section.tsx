import { useJbCylinderReportPrint } from "../../model/jb/use-jb-cylinder-report-print";
import type { OperatorJbPanel } from "../../model/types";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionJbDocumentsTable } from "./jb-documents-table";
import { useTestEventStompCount } from "@/shared/api/websocket/use-test-event-stomp-count";

type OrderExecutionJbSectionProps = {
    jb: OperatorJbPanel;
    workAreaId?: string;
};

export function OrderExecutionJbSection({ jb, workAreaId }: OrderExecutionJbSectionProps) {
    const { printJbDocument, printingRowId, printError } = useJbCylinderReportPrint({ workAreaId });
    const testEventCount = useTestEventStompCount({ enabled: import.meta.env.DEV });
    const headerCount = import.meta.env.DEV ? testEventCount ?? jb.headerCount : jb.headerCount;

    return (
        <OrderExecutionCollapsibleSection
            title="JB"
            defaultOpen={false}
            tone="system"
            count={headerCount}
        >
            <OrderExecutionJbDocumentsTable
                groups={jb.groups}
                printingRowId={printingRowId}
                printError={printError}
                onPrint={(rowId) => {
                    void printJbDocument(rowId);
                }}
            />
        </OrderExecutionCollapsibleSection>
    );
}
