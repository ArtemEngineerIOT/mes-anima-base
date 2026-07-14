import { useJbCylinderReportPrint } from "../../model/jb/use-jb-cylinder-report-print";
import type { OperatorJbPanel } from "../../model/types";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionJbDocumentsTable } from "./jb-documents-table";

type OrderExecutionJbSectionProps = {
    jb: OperatorJbPanel;
    workAreaId?: string;
};

export function OrderExecutionJbSection({ jb, workAreaId }: OrderExecutionJbSectionProps) {
    const { printJbDocument, printingRowId, printError } = useJbCylinderReportPrint({ workAreaId });

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
