import { useDataTablePagination } from "@/shared/lib/data-table-pagination";
import { cn } from "@/shared/lib/css";
import { DataTablePaginationFooter } from "@/shared/ui/kit/data-table-pagination-footer";
import {
    dataTableBodyCellClassName,
    dataTableHeadCellClassName,
    dataTableInsetShellClassName,
    dataTableViewportFooterClassName,
    dataTableViewportShellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import type { StageReleasedSeriesRow } from "../../model/stage-completion-types";

/** Временно скрыта колонка «Перемотка». */
const SHOW_REWIND_COLUMN = false;

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
            <div className={dataTableViewportShellClassName}>
                <div className="min-w-0 overflow-x-auto">
                    <Table
                        className={cn(
                            dataTableInsetShellClassName,
                            "min-w-[760px] border-separate border-spacing-0 text-[12px]",
                        )}
                    >
                        <TableHeader>
                            <TableRow className="hover:!bg-transparent">
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Артикул</TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Номен.</TableHead>
                                {SHOW_REWIND_COLUMN ? (
                                    <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40", "text-center")}>
                                        Перемотка
                                    </TableHead>
                                ) : null}
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Серия</TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40", "text-right")}>
                                    Нетто
                                </TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40", "text-right")}>
                                    Брутто
                                </TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Ед. изм. 1</TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40", "text-right")}>
                                    Кол-во 1
                                </TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>FR</TableHead>
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
                                        <TableCell className={dataTableBodyCellClassName}>{row.article}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.nomenclature}</TableCell>
                                        {SHOW_REWIND_COLUMN ? (
                                            <TableCell className={cn(dataTableBodyCellClassName, "text-center")}>
                                                <input
                                                    type="checkbox"
                                                    checked={row.rewind}
                                                    readOnly
                                                    className="h-4 w-4 accent-primary"
                                                    disabled
                                                    aria-label={`Серия ${row.series}`}
                                                />
                                            </TableCell>
                                        ) : null}
                                        <TableCell className={dataTableBodyCellClassName}>{row.series}</TableCell>
                                        <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                            {formatNumber(row.netWeight)}
                                        </TableCell>
                                        <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                            {formatNumber(row.grossWeight)}
                                        </TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.unit}</TableCell>
                                        <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                            {formatNumber(row.quantity)}
                                        </TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.fr}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={SHOW_REWIND_COLUMN ? 9 : 8}
                                        className={cn(dataTableBodyCellClassName, "py-6 text-center text-muted-foreground")}
                                    >
                                        Нет выпущенных серий
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className={dataTableViewportFooterClassName}>
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
                </div>
            </div>
        </div>
    );
}
