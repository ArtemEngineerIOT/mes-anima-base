import { Fragment, useState } from "react";

import { useDataTablePagination } from "@/shared/lib/data-table-pagination";
import { cn } from "@/shared/lib/css";
import { DataTablePaginationFooter } from "@/shared/ui/kit/data-table-pagination-footer";
import { DataTablePanel } from "@/shared/ui/kit/data-table-panel";
import { Icon } from "@/shared/ui/kit/icon";
import {
    dataTableBodyCellClassName,
    dataTableInsetShellClassName,
    dataTablePanelHeadCellClassName,
    dataTablePanelTableClassName,
    type DataTablePageSize,
} from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import type { StageEventJournalRow } from "../../model/stage-completion-types";

const expandColumnClassName = "w-10";
const journalHeadCellClassName = cn(dataTablePanelHeadCellClassName, "whitespace-nowrap");
const journalBodyCellClassName = cn(dataTableBodyCellClassName, "whitespace-nowrap");

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
            <DataTablePanel
                footer={
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
                }
            >
                <Table className={cn(dataTablePanelTableClassName, "min-w-[640px]")}>
                        <TableHeader>
                            <TableRow className="hover:!bg-transparent">
                                <TableHead
                                    className={cn(journalHeadCellClassName, expandColumnClassName)}
                                    aria-label="Детали события"
                                />
                                <TableHead className={journalHeadCellClassName}>Код события</TableHead>
                                <TableHead className={journalHeadCellClassName}>Начало</TableHead>
                                <TableHead className={journalHeadCellClassName}>Конец</TableHead>
                                <TableHead className={cn(journalHeadCellClassName, "text-right")}>Метраж</TableHead>
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
                                                <TableCell className={cn(journalBodyCellClassName, expandColumnClassName)}>
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
                                                <TableCell className={journalBodyCellClassName} title={row.eventCode}>
                                                    {row.eventCode}
                                                </TableCell>
                                                <TableCell className={journalBodyCellClassName}>{row.start}</TableCell>
                                                <TableCell className={journalBodyCellClassName}>{row.end}</TableCell>
                                                <TableCell className={cn(journalBodyCellClassName, "text-right tabular-nums")}>
                                                    {formatNumber(row.meterage)}
                                                </TableCell>
                                            </TableRow>
                                            {hasDetails && isExpanded ? (
                                                <TableRow className="bg-muted/20 hover:!bg-muted/20">
                                                    <TableCell className={journalBodyCellClassName} />
                                                    <TableCell colSpan={4} className="p-0">
                                                        <div className="px-4 py-2">
                                                            <Table
                                                                className={cn(
                                                                    dataTableInsetShellClassName,
                                                                    "border-collapse text-[12px]",
                                                                )}
                                                            >
                                                                <TableHeader>
                                                                    <TableRow className="hover:!bg-transparent">
                                                                        <TableHead className={journalHeadCellClassName}>
                                                                            Параметр
                                                                        </TableHead>
                                                                        <TableHead className={journalHeadCellClassName}>
                                                                            Значение
                                                                        </TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {details.map((detail) => (
                                                                        <TableRow key={detail.parameter}>
                                                                            <TableCell
                                                                                className={cn(
                                                                                    journalBodyCellClassName,
                                                                                    "text-muted-foreground",
                                                                                )}
                                                                                title={detail.parameter}
                                                                            >
                                                                                {detail.parameter}
                                                                            </TableCell>
                                                                            <TableCell
                                                                                className={journalBodyCellClassName}
                                                                                title={detail.value}
                                                                            >
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
            </DataTablePanel>
            <div className="text-right text-[12px] font-bold uppercase text-foreground">
                Метраж. Итого: {formatNumber(totalEventMeterage)}
            </div>
        </div>
    );
}
