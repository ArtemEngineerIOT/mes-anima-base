import { useJbCylinderReportPrint } from "../../model/jb/use-jb-cylinder-report-print";
import type { OperatorJbPanel } from "../../model/types";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionJbDocumentsTable } from "./jb-documents-table";

type OrderExecutionJbSectionProps = {
    jb: OperatorJbPanel;
    workAreaId?: string;
    workAreaStart?: string;
    order?: string;
};

export function OrderExecutionJbSection({
    jb,
    workAreaId,
    workAreaStart,
    order,
}: OrderExecutionJbSectionProps) {
    const { printJbDocument, printingRowId, printError } = useJbCylinderReportPrint({
        workAreaId,
        workAreaStart,
        order,
    });

    return (
        <OrderExecutionCollapsibleSection
            title="JB"
            defaultOpen={false}
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
