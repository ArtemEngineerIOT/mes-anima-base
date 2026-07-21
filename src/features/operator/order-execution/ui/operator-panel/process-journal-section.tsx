import { Fragment, useMemo, useState } from "react";

import { useDataTablePagination } from "@/shared/lib/data-table-pagination";
import { cn } from "@/shared/lib/css";
import { DataTablePaginationFooter } from "@/shared/ui/kit/data-table-pagination-footer";
import { Icon } from "@/shared/ui/kit/icon";
import { Informer } from "@/shared/ui/kit/informer";
import {
    dataTableBodyCellClassName,
    dataTableHeadCellClassName,
    dataTableInsetShellClassName,
    dataTableViewportFooterClassName,
    dataTableViewportShellClassName,
    type DataTablePageSize,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import { useEventRegistrationContext } from "../../model/event-registration/event-registration-context";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";

const expandColumnClassName = "w-10";

function formatNumber(value: number): string {
    return new Intl.NumberFormat("ru-RU").format(value);
}

function formatTotalLength(totalLengthM: number | null): string {
    if (typeof totalLengthM === "number" && Number.isFinite(totalLengthM)) {
        return formatNumber(totalLengthM);
    }

    return "—";
}

type OrderExecutionProcessJournalSectionProps = {
    onExpandedChange?: (expanded: boolean) => void;
};

export function OrderExecutionProcessJournalSection({
    onExpandedChange,
}: OrderExecutionProcessJournalSectionProps) {
    const {
        journal,
        totalLengthM,
        isJournalLoading,
        journalLoadError,
    } = useEventRegistrationContext();
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

    const { pageItems, pagination, pageSize, setPageSize, setPage } = useDataTablePagination(journal, {
        initialPageSize: 10,
    });

    const totalLengthLabel = useMemo(() => formatTotalLength(totalLengthM), [totalLengthM]);

    const handlePageChange = (page: number) => {
        setExpandedRowId(null);
        setPage(page);
    };

    const handlePageSizeChange = (nextPageSize: DataTablePageSize) => {
        setExpandedRowId(null);
        setPageSize(nextPageSize);
    };

    return (
        <OrderExecutionCollapsibleSection
            title="Журнал процесса"
            defaultOpen={false}
            onExpandedChange={onExpandedChange}
        >
            <div className="grid gap-3">
                {journalLoadError ? (
                    <Informer tone="alert" variant="bordered" size="s" title="Ошибка загрузки" description={journalLoadError} />
                ) : null}

                {isJournalLoading ? (
                    <Informer tone="system" variant="bordered" size="s" title="Загрузка журнала процесса…" />
                ) : null}

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
                                    const hasDetails = Boolean(row.details && row.details.length > 0);

                                    return (
                                        <Fragment key={row.id}>
                                            <TableRow className={cn(isExpanded && "bg-muted/50")}>
                                                <TableCell className={cn(dataTableBodyCellClassName, expandColumnClassName)}>
                                                    {hasDetails ? (
                                                        <button
                                                            type="button"
                                                            className="inline-flex size-7 items-center justify-center rounded-sm hover:bg-accent"
                                                            onClick={() => setExpandedRowId(isExpanded ? null : row.id)}
                                                            aria-label="Развернуть событие"
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
                                                <TableCell className={dataTableBodyCellClassName}>{row.eventCodeLabel}</TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>{row.timeStart}</TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>{row.timeEnd}</TableCell>
                                                <TableCell className={cn(dataTableBodyCellClassName, "text-right tabular-nums")}>
                                                    {row.lengthM}
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
                                                                            className={cn(
                                                                                dataTableHeadCellClassName,
                                                                                "bg-muted/40",
                                                                            )}
                                                                        >
                                                                            Параметр
                                                                        </TableHead>
                                                                        <TableHead
                                                                            className={cn(
                                                                                dataTableHeadCellClassName,
                                                                                "bg-muted/40",
                                                                            )}
                                                                        >
                                                                            Значение
                                                                        </TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {row.details?.map((detail) => (
                                                                        <TableRow key={`${row.id}-${detail.parameter}`}>
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
                                        className={cn(
                                            dataTableBodyCellClassName,
                                            "py-6 text-center text-muted-foreground",
                                        )}
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
                    Метраж. Итого: {totalLengthLabel}
                </div>
            </div>
        </OrderExecutionCollapsibleSection>
    );
}
