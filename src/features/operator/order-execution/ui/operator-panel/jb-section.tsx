import { useState } from "react";

import { FloatingAutoDismissInformer } from "@/shared/ui/kit/floating-auto-dismiss-informer";

import { useJbCylinderReportPrint } from "../../model/jb/use-jb-cylinder-report-print";
import { useJbTable } from "../../model/jb/use-jb-table";
import type { MachineId } from "../../model/types";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionJbDocumentsTable } from "./jb-documents-table";

type OrderExecutionJbSectionProps = {
    machineId: MachineId;
    workAreaId?: string;
    workAreaStart?: string;
    order?: string;
};

export function OrderExecutionJbSection({
    machineId,
    workAreaId,
    workAreaStart,
    order,
}: OrderExecutionJbSectionProps) {
    const [expanded, setExpanded] = useState(false);
    const { panel, isLoading, error, errorKey, dismissError } = useJbTable({
        machineId,
        enabled: expanded && Boolean(machineId?.trim()),
    });
    const { printJbDocument, printingRowId, printError, dismissPrintError } = useJbCylinderReportPrint({
        workAreaId,
        workAreaStart,
        order,
    });

    return (
        <>
            <OrderExecutionCollapsibleSection
                title="JB"
                defaultOpen={false}
                count={panel.headerCount}
                tone={panel.headerCount ? "system" : undefined}
                isContentReady={!isLoading}
                onExpandedChange={setExpanded}
            >
                <OrderExecutionJbDocumentsTable
                    groups={panel.groups}
                    printingRowId={printingRowId}
                    onPrint={(rowId) => {
                        void printJbDocument(rowId);
                    }}
                />
            </OrderExecutionCollapsibleSection>

            {error ? (
                <FloatingAutoDismissInformer
                    key={`jb-load-error:${errorKey}`}
                    tone="alert"
                    variant="bordered"
                    size="s"
                    title="Ошибка"
                    description={error}
                    onDismiss={dismissError}
                />
            ) : null}

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
        </>
    );
}
