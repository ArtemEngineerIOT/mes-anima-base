import { Fragment, useState } from "react";

import { useDataTablePagination } from "@/shared/lib/data-table-pagination";
import { cn } from "@/shared/lib/css";
import { DataTablePaginationFooter } from "@/shared/ui/kit/data-table-pagination-footer";
import { Icon } from "@/shared/ui/kit/icon";
import {
    dataTableBodyCellClassName,
    dataTableHeadCellClassName,
    dataTableInsetShellClassName,
    dataTableViewportFooterClassName,
    dataTableViewportShellClassName,
    type DataTablePageSize,
} from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import type { StageEventJournalRow } from "../../model/stage-completion-types";

const expandColumnClassName = "w-10";

function formatNumber(value: number): string {
    return value.toLocaleString("ru-RU");
}

type StageCompletionEventJournalTableProps = {
    rows: StageEventJournalRow[];
    totalEventMeterage: number;
};

export function StageCompletionEventJournalTable({
    rows,
    totalEventMeterage,
}: StageCompletionEventJournalTableProps) {
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

    const { pageItems, pagination, pageSize, setPageSize, setPage } = useDataTablePagination(rows, {
        initialPageSize: 5,
    });

    const handlePageChange = (page: number) => {
        setExpandedRowId(null);
        setPage(page);
    };

    const handlePageSizeChange = (nextPageSize: DataTablePageSize) => {
        setExpandedRowId(null);
        setPageSize(nextPageSize);
    };

    return (
        <div className="grid gap-2">
            <div className={cnSectionBlockTitle()}>Журнал событий</div>
            <div className={dataTableViewportShellClassName}>
                <div className="min-w-0 overflow-x-auto">
                    <Table
                        className={cn(
                            dataTableInsetShellClassName,
                            "min-w-[640px] border-separate border-spacing-0 text-[12px]",
                        )}
                    >
                        <TableHeader>
                            <TableRow className="hover:!bg-transparent">
                                <TableHead
                                    className={cn(dataTableHeadCellClassName, "bg-muted/40", expandColumnClassName)}
                                    aria-label="Детали события"
                                />
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Код события</TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Начало</TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Конец</TableHead>
                                <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40", "text-right")}>
                                    Метраж
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pageItems.length > 0 ? (
                                pageItems.map((row) => {
                                    const isExpanded = expandedRowId === row.id;
                                    const details = row.details ?? [];
                                    const hasDetails = details.length > 0;

                                    return (
                                        <Fragment key={row.id}>
                                            <TableRow className={cn(isExpanded && "bg-muted/50")}>
                                                <TableCell className={cn(dataTableBodyCellClassName, expandColumnClassName)}>
                                                    {hasDetails ? (
                                                        <button
                                                            type="button"
                                                            className="inline-flex size-7 items-center justify-center rounded-sm hover:bg-accent"
                                                            onClick={() => setExpandedRowId(isExpanded ? null : row.id)}
                                                            aria-label={isExpanded ? "Свернуть событие" : "Развернуть событие"}
                                                        >
                                                            <Icon
                                                                name="expand_more"
                                                                size="md"
                                                                className={cn(
                                                                    "text-muted-foreground transition-transform",
                                                                    isExpanded ? "rotate-180" : "rotate-0",
                                                                )}
                                                            />
                                                        </button>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>{row.eventCode}</TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>{row.start}</TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>{row.end}</TableCell>
                                                <TableCell className={cn(dataTableBodyCellClassName, "text-right tabular-nums")}>
                                                    {formatNumber(row.meterage)}
                                                </TableCell>
                                            </TableRow>
                                            {hasDetails && isExpanded ? (
                                                <TableRow className="bg-muted/20 hover:!bg-muted/20">
                                                    <TableCell className={dataTableBodyCellClassName} />
                                                    <TableCell colSpan={4} className="p-0">
                                                        <div className="px-4 py-2">
                                                            <Table
                                                                className={cn(
                                                                    dataTableInsetShellClassName,
                                                                    "border-separate border-spacing-0 text-[12px]",
                                                                )}
                                                            >
                                                                <TableHeader>
                                                                    <TableRow className="hover:!bg-transparent">
                                                                        <TableHead
                                                                            className={cn(dataTableHeadCellClassName, "bg-muted/40")}
                                                                        >
                                                                            Параметр
                                                                        </TableHead>
                                                                        <TableHead
                                                                            className={cn(dataTableHeadCellClassName, "bg-muted/40")}
                                                                        >
                                                                            Значение
                                                                        </TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {details.map((detail) => (
                                                                        <TableRow key={detail.parameter}>
                                                                            <TableCell
                                                                                className={cn(
                                                                                    dataTableBodyCellClassName,
                                                                                    "text-muted-foreground",
                                                                                )}
                                                                            >
                                                                                {detail.parameter}
                                                                            </TableCell>
                                                                            <TableCell className={dataTableBodyCellClassName}>
                                                                                {detail.value}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : null}
                                        </Fragment>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className={cn(dataTableBodyCellClassName, "py-6 text-center text-muted-foreground")}
                                    >
                                        События ещё не зарегистрированы
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
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </div>
            </div>
            <div className="text-right text-[12px] font-bold uppercase text-foreground">
                Метраж. Итого: {formatNumber(totalEventMeterage)}
            </div>
        </div>
    );
}
