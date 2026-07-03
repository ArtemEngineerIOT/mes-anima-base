import { Button } from "@/shared/ui/kit/button";
import { Icon } from "@/shared/ui/kit/icon";
import type { InformerTone } from "@/shared/ui/kit/informer";
import { InformerPill } from "@/shared/ui/kit/informer-pill";
import { cn } from "@/shared/lib/css";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import { JB_CYLINDER_LIST_ROW_ID, JB_INK_RECIPE_ROW_ID, JB_PRINT_PARAMS_MAP_ROW_ID, JB_SECTION_LABEL_ROW_ID, JB_STAGE_INFO_ROW_ID } from "../../model/jb/constants";
import type { JobBagDocumentGroup, JobBagDocumentRow, JobBagDocumentStatus } from "../../model/types";

const JB_PRINTABLE_ROW_IDS = new Set([
    JB_CYLINDER_LIST_ROW_ID,
    JB_STAGE_INFO_ROW_ID,
    JB_PRINT_PARAMS_MAP_ROW_ID,
    JB_INK_RECIPE_ROW_ID,
    JB_SECTION_LABEL_ROW_ID,
]);

type JbDocumentActionsProps = {
    row: JobBagDocumentRow;
    printingRowId: string | null;
    onPrint: (rowId: string) => void;
};

function jbStatusTone(status: JobBagDocumentStatus): InformerTone {
    return status === "ready_for_print" ? "success" : "warning";
}

function JbDocumentActions({ row, printingRowId, onPrint }: JbDocumentActionsProps) {
    const isPrintable = JB_PRINTABLE_ROW_IDS.has(row.id);
    const isPrinting = printingRowId === row.id;

    return (
        <div className="flex items-center justify-end">
            <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="size-7 shrink-0"
                aria-label={`Печать: ${row.label}`}
                disabled={!isPrintable || isPrinting}
                onClick={isPrintable ? () => onPrint(row.id) : undefined}
            >
                <Icon name="print" size="sm" />
            </Button>
        </div>
    );
}

type JbDocumentGroupTableProps = {
    group: JobBagDocumentGroup;
    printingRowId: string | null;
    onPrint: (rowId: string) => void;
};

function JbDocumentGroupTable({ group, printingRowId, onPrint }: JbDocumentGroupTableProps) {
    return (
        <div className={dataTableScrollViewportClassName}>
            <Table className={cn(dataTableShellClassName, "text-[12px]")}>
            <TableHeader className="bg-muted/40">
                <TableRow>
                    <TableHead className={dataTableStickyHeadCellClassName}>{group.title}</TableHead>
                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-[180px] text-center")}>СТАТУС</TableHead>
                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-[72px] text-right")}>ДЕЙСТВИЕ</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {group.rows.map((row, index) => (
                    <TableRow key={row.id} className={cn(index % 2 === 1 && "bg-muted/30")}>
                        <TableCell className={dataTableBodyCellClassName}>{row.label}</TableCell>
                        <TableCell className={cn(dataTableBodyCellClassName, "text-center")}>
                            <InformerPill tone={jbStatusTone(row.status)} variant="filled" className="uppercase">
                                {row.statusLabel}
                            </InformerPill>
                        </TableCell>
                        <TableCell className={dataTableBodyCellClassName}>
                            <JbDocumentActions
                                row={row}
                                printingRowId={printingRowId}
                                onPrint={onPrint}
                            />
                        </TableCell>
                    </TableRow>
                ))}
                {group.rows.length === 0 && (
                    <TableRow>
                        <TableCell
                            className={cn(dataTableBodyCellClassName, "py-6 text-center text-muted-foreground")}
                            colSpan={3}
                        >
                            Нет документов
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
    );
}

type OrderExecutionJbDocumentsTableProps = {
    groups: JobBagDocumentGroup[];
    printingRowId: string | null;
    printError?: string | null;
    onPrint: (rowId: string) => void;
};

export function OrderExecutionJbDocumentsTable({
    groups,
    printingRowId,
    printError = null,
    onPrint,
}: OrderExecutionJbDocumentsTableProps) {
    if (groups.length === 0) {
        return <p className="text-sm text-muted-foreground">Документы JB не загружены</p>;
    }

    return (
        <div className="grid gap-4">
            {printError ? <div className="text-[12px] text-destructive">{printError}</div> : null}
            {groups.map((group) => (
                <JbDocumentGroupTable
                    key={group.id}
                    group={group}
                    printingRowId={printingRowId}
                    onPrint={onPrint}
                />
            ))}
        </div>
    );
}
