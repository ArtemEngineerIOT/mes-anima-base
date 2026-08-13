import { FloatingAutoDismissInformer } from "@/shared/ui/kit/floating-auto-dismiss-informer";

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
    const { printJbDocument, printingRowId, printError, dismissPrintError } = useJbCylinderReportPrint({
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
                onPrint={(rowId) => {
                    void printJbDocument(rowId);
                }}
            />
            {printError ? (
                <FloatingAutoDismissInformer
                    key={`jb-print-error:${printError}`}
                    tone="alert"
                    variant="bordered"
                    size="s"
                    title="Ошибка"
                    description={printError}
                    onDismiss={dismissPrintError}
                />
            ) : null}
        </OrderExecutionCollapsibleSection>
    );
}
