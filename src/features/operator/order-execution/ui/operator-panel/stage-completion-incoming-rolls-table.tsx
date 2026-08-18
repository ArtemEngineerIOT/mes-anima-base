import { useDataTablePagination } from "@/shared/lib/data-table-pagination";
import { cn } from "@/shared/lib/css";
import { DataTablePaginationFooter } from "@/shared/ui/kit/data-table-pagination-footer";
import { DataTablePanel } from "@/shared/ui/kit/data-table-panel";
import {
    dataTableBodyCellClassName,
    dataTablePanelHeadCellClassName,
    dataTablePanelTableClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import type { StageIncomingRollRow } from "../../model/stage-completion-types";

const incomingRollHeadCellClassName = cn(dataTablePanelHeadCellClassName, "whitespace-nowrap");
const incomingRollBodyCellClassName = cn(dataTableBodyCellClassName, "whitespace-nowrap");

function formatNumber(value: number): string {
    return value.toLocaleString("ru-RU");
}

type StageCompletionIncomingRollsTableProps = {
    rows: StageIncomingRollRow[];
};

export function StageCompletionIncomingRollsTable({ rows }: StageCompletionIncomingRollsTableProps) {
    const { pageItems, pagination, pageSize, setPageSize, setPage } = useDataTablePagination(rows, {
        initialPageSize: 5,
    });

    return (
        <div className="grid gap-2">
            <div className={cnSectionBlockTitle()}>Входящие рулоны</div>
            <DataTablePanel
                footer={
                    <DataTablePaginationFooter
                        totalCount={pagination.totalCount}
                        rangeStart={pagination.rangeStart}
                        rangeEnd={pagination.rangeEnd}
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                    />
                }
            >
                <Table className={cn(dataTablePanelTableClassName, "min-w-[760px]")}>
                        <TableHeader>
                            <TableRow className="hover:!bg-transparent">
                                <TableHead className={incomingRollHeadCellClassName}>Номенклатура</TableHead>
                                <TableHead className={incomingRollHeadCellClassName}>Тип</TableHead>
                                <TableHead className={incomingRollHeadCellClassName}>Серия</TableHead>
                                <TableHead className={cn(incomingRollHeadCellClassName, "text-right")}>
                                    Количество
                                </TableHead>
                                <TableHead className={incomingRollHeadCellClassName}>Ед. изм.</TableHead>
                                <TableHead className={incomingRollHeadCellClassName}>Машина</TableHead>
                                <TableHead className={incomingRollHeadCellClassName}>Статус</TableHead>
                                <TableHead className={incomingRollHeadCellClassName}>FR</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pageItems.length > 0 ? (
                                pageItems.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className={
                                            row.blocked
                                                ? "!bg-destructive/15 hover:!bg-destructive/25 dark:!bg-destructive/20"
                                                : undefined
                                        }
                                    >
                                        <TableCell className={incomingRollBodyCellClassName} title={row.material}>
                                            {row.material}
                                        </TableCell>
                                        <TableCell className={incomingRollBodyCellClassName} title={row.nomenclature}>
                                            {row.nomenclature}
                                        </TableCell>
                                        <TableCell className={incomingRollBodyCellClassName} title={row.series}>
                                            {row.series}
                                        </TableCell>
                                        <TableCell className={cn(incomingRollBodyCellClassName, "text-right")}>
                                            {formatNumber(row.quantity)}
                                        </TableCell>
                                        <TableCell className={incomingRollBodyCellClassName}>{row.unit}</TableCell>
                                        <TableCell className={incomingRollBodyCellClassName}>{row.machine}</TableCell>
                                        <TableCell className={incomingRollBodyCellClassName}>{row.status}</TableCell>
                                        <TableCell className={incomingRollBodyCellClassName}>{row.fr}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className={cn(dataTableBodyCellClassName, "py-6 text-center text-muted-foreground")}
                                    >
                                        Нет входящих рулонов
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
            </DataTablePanel>
        </div>
    );
}
