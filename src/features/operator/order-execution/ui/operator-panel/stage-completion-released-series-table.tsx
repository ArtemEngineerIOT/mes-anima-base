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

import type { StageReleasedSeriesRow } from "../../model/stage-completion-types";

const releasedSeriesHeadCellClassName = cn(dataTablePanelHeadCellClassName, "whitespace-nowrap");
const releasedSeriesBodyCellClassName = cn(dataTableBodyCellClassName, "whitespace-nowrap");

function formatNumber(value: number): string {
    return value.toLocaleString("ru-RU");
}

type StageCompletionReleasedSeriesTableProps = {
    rows: StageReleasedSeriesRow[];
};

export function StageCompletionReleasedSeriesTable({ rows }: StageCompletionReleasedSeriesTableProps) {
    const { pageItems, pagination, pageSize, setPageSize, setPage } = useDataTablePagination(rows, {
        initialPageSize: 5,
    });

    return (
        <div className="grid gap-2">
            <div className={cnSectionBlockTitle()}>Выпущенные серии</div>
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
                <Table className={cn(dataTablePanelTableClassName, "min-w-[720px]")}>
                        <TableHeader>
                            <TableRow className="hover:!bg-transparent">
                                <TableHead className={releasedSeriesHeadCellClassName}>Номенклатура</TableHead>
                                <TableHead className={releasedSeriesHeadCellClassName}>Серия</TableHead>
                                <TableHead className={cn(releasedSeriesHeadCellClassName, "text-right")}>
                                    Кол-во 1
                                </TableHead>
                                <TableHead className={releasedSeriesHeadCellClassName}>Ед. изм. 1</TableHead>
                                <TableHead className={cn(releasedSeriesHeadCellClassName, "text-right")}>
                                    Кол-во 2
                                </TableHead>
                                <TableHead className={releasedSeriesHeadCellClassName}>Ед. изм. 2</TableHead>
                                <TableHead className={releasedSeriesHeadCellClassName}>FR</TableHead>
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
                                        <TableCell className={releasedSeriesBodyCellClassName} title={row.nomenclature}>
                                            {row.nomenclature}
                                        </TableCell>
                                        <TableCell className={releasedSeriesBodyCellClassName} title={row.series}>
                                            {row.series}
                                        </TableCell>
                                        <TableCell className={cn(releasedSeriesBodyCellClassName, "text-right tabular-nums")}>
                                            {formatNumber(row.quantityPrimary)}
                                        </TableCell>
                                        <TableCell className={releasedSeriesBodyCellClassName}>{row.uomPrimary}</TableCell>
                                        <TableCell className={cn(releasedSeriesBodyCellClassName, "text-right tabular-nums")}>
                                            {formatNumber(row.quantitySecondary)}
                                        </TableCell>
                                        <TableCell className={releasedSeriesBodyCellClassName}>{row.uomSecondary}</TableCell>
                                        <TableCell className={releasedSeriesBodyCellClassName}>{row.fr}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className={cn(dataTableBodyCellClassName, "py-6 text-center text-muted-foreground")}
                                    >
                                        Нет выпущенных серий
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
            </DataTablePanel>
        </div>
    );
}
