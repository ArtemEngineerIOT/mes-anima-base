import { useJbCylinderReportPrint } from "../../model/jb/use-jb-cylinder-report-print";
import type { OperatorJbPanel } from "../../model/types";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionJbDocumentsTable } from "./jb-documents-table";

type OrderExecutionJbSectionProps = {
    jb: OperatorJbPanel;
};

export function OrderExecutionJbSection({ jb }: OrderExecutionJbSectionProps) {
    const { printJbDocument, printingRowId, printError } = useJbCylinderReportPrint();

    return (
        <OrderExecutionCollapsibleSection
            title="JB"
            defaultOpen={false}
            tone="system"
            count={jb.headerCount}
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
