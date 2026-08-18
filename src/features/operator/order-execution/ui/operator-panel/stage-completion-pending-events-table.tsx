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

import type { StagePendingEventRow } from "../../model/stage-completion-types";

const pendingEventsHeadCellClassName = cn(dataTablePanelHeadCellClassName, "whitespace-nowrap");
const pendingEventsBodyCellClassName = cn(dataTableBodyCellClassName, "whitespace-nowrap");

type StageCompletionPendingEventsTableProps = {
    rows: StagePendingEventRow[];
};

export function StageCompletionPendingEventsTable({ rows }: StageCompletionPendingEventsTableProps) {
    const { pageItems, pagination, pageSize, setPageSize, setPage } = useDataTablePagination(rows, {
        initialPageSize: 5,
    });

    return (
        <div className="grid gap-2">
            <div className={cnSectionBlockTitle()}>Необработанные события</div>
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
                <Table className={cn(dataTablePanelTableClassName, "min-w-[520px]")}>
                        <TableHeader>
                            <TableRow className="hover:!bg-transparent">
                                <TableHead className={pendingEventsHeadCellClassName}>Сигнал с машины</TableHead>
                                <TableHead className={pendingEventsHeadCellClassName}>Начало</TableHead>
                                <TableHead className={pendingEventsHeadCellClassName}>Завершение</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pageItems.length > 0 ? (
                                pageItems.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className={pendingEventsBodyCellClassName} title={row.signal}>
                                            {row.signal}
                                        </TableCell>
                                        <TableCell className={pendingEventsBodyCellClassName}>{row.start}</TableCell>
                                        <TableCell className={pendingEventsBodyCellClassName}>{row.end}</TableCell>
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
            </DataTablePanel>
        </div>
    );
}
