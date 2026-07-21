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

import type { StageIncomingRollRow } from "../../model/stage-completion-types";

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
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Номенклатура</TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Номенклатура</TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Серия</TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40", "text-right")}>
                                    Количество
                                </TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Ед. изм.</TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Машина</TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Статус</TableHead>
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
                                        <TableCell className={dataTableBodyCellClassName}>{row.material}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.nomenclature}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.series}</TableCell>
                                        <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                            {formatNumber(row.quantity)}
                                        </TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.unit}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.machine}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.status}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.fr}</TableCell>
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
