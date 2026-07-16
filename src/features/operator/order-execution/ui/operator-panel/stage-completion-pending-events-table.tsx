import { useDataTablePagination } from "@/shared/lib/data-table-pagination";
import { cn } from "@/shared/lib/css";
import { DataTablePaginationFooter } from "@/shared/ui/kit/data-table-pagination-footer";
import { DataTableViewport } from "@/shared/ui/kit/data-table-viewport";
import {
    dataTableBodyCellClassName,
    dataTableHeadCellClassName,
    dataTableInsetShellClassName,
    dataTableSplitScrollBodyClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import type { StagePendingEventRow } from "../../model/stage-completion-types";

type StageCompletionPendingEventsTableProps = {
    rows: StagePendingEventRow[];
};

export function StageCompletionPendingEventsTable({ rows }: StageCompletionPendingEventsTableProps) {
    const { pageItems, pagination, pageSize, setPageSize, setPage } = useDataTablePagination(rows, {
        initialPageSize: 10,
    });

    return (
        <div className="grid gap-2">
            <div className={cnSectionBlockTitle()}>Необработанные события</div>
            <DataTableViewport
                layout="fixed"
                visibleBodyRows={pageSize}
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
                <Table className={cn(dataTableInsetShellClassName, "min-w-[520px] border-separate border-spacing-0 text-[12px]")}>
                    <TableHeader>
                        <TableRow className="hover:!bg-transparent">
                            <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>
                                Сигнал с машины
                            </TableHead>
                            <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Начало</TableHead>
                            <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Завершение</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className={dataTableSplitScrollBodyClassName}>
                        {pageItems.length > 0 ? (
                            pageItems.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className={dataTableBodyCellClassName}>{row.signal}</TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{row.start}</TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{row.end}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className={cn(dataTableBodyCellClassName, "py-6 text-center text-muted-foreground")}
                                >
                                    Нет необработанных событий
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </DataTableViewport>
        </div>
    );
}
