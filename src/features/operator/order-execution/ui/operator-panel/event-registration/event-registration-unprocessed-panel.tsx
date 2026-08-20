import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { useDataTablePagination } from "@/shared/lib/data-table-pagination";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { DataTablePaginationFooter } from "@/shared/ui/kit/data-table-pagination-footer";
import { DataTablePanel } from "@/shared/ui/kit/data-table-panel";
import { Label } from "@/shared/ui/kit/label";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import {
    dataTableBodyCellClassName,
    dataTablePanelHeadCellClassName,
    dataTablePanelTableClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import {
    nextUnprocessedMachineEventDetectedAtSortDirection,
    sortUnprocessedMachineEventsByDetectedAt,
    type UnprocessedMachineEventDetectedAtSortDirection,
} from "../../../model/event-registration/sort-unprocessed-machine-events-by-detected-at";
import type { useEventRegistration } from "../../../model/event-registration/use-event-registration";

type Registration = ReturnType<typeof useEventRegistration>;

const textareaClass =
    "placeholder:text-muted-foreground min-h-[72px] w-full resize-y rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const selectionColumnClassName = "w-10";

export function EventRegistrationUnprocessedPanel({
    registration,
    disabled,
}: {
    registration: Registration;
    disabled?: boolean;
}) {
    const {
        unprocessed,
        selectedUnprocessedId,
        deleteComment,
        isDiscardSignalsPending,
        toggleUnprocessedSelection,
        deleteSelectedSignals,
        setDeleteComment,
        canDeleteSelectedSignals,
    } = registration;

    const [detectedAtSortDirection, setDetectedAtSortDirection] =
        useState<UnprocessedMachineEventDetectedAtSortDirection>("none");

    const sortedUnprocessed = useMemo(
        () => sortUnprocessedMachineEventsByDetectedAt(unprocessed, detectedAtSortDirection),
        [detectedAtSortDirection, unprocessed],
    );

    const { pageItems, pagination, pageSize, setPageSize, setPage } = useDataTablePagination(
        sortedUnprocessed,
        {
            initialPageSize: 5,
        },
    );

    const sortLabel =
        detectedAtSortDirection === "none"
            ? "без сортировки"
            : detectedAtSortDirection === "desc"
              ? "по убыванию"
              : "по возрастанию";

    const sortIcon =
        detectedAtSortDirection === "none" ? (
            <ArrowUpDown className="size-3.5 shrink-0 text-muted-foreground/50" aria-hidden />
        ) : detectedAtSortDirection === "desc" ? (
            <ArrowDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
            <ArrowUp className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        );

    return (
        <div className="grid gap-3">
            <div className={cnSectionBlockTitle()}>Необработанные сигналы машины</div>

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
                            <TableHead
                                className={cn(dataTablePanelHeadCellClassName, selectionColumnClassName)}
                                aria-label="Выбор сигнала"
                            />
                            <TableHead className={dataTablePanelHeadCellClassName}>Описание</TableHead>
                            <TableHead
                                className={dataTablePanelHeadCellClassName}
                                aria-sort={
                                    detectedAtSortDirection === "none"
                                        ? "none"
                                        : detectedAtSortDirection === "asc"
                                          ? "ascending"
                                          : "descending"
                                }
                            >
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-0.5 text-left uppercase hover:text-foreground"
                                    onClick={() => {
                                        setDetectedAtSortDirection((prev) =>
                                            nextUnprocessedMachineEventDetectedAtSortDirection(prev),
                                        );
                                        setPage(1);
                                    }}
                                    aria-label={`Сортировать по началу: ${sortLabel}`}
                                >
                                    <span>{"Начало".toLocaleUpperCase("ru-RU")}</span>
                                    {sortIcon}
                                </button>
                            </TableHead>
                            <TableHead className={dataTablePanelHeadCellClassName}>Завершение</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageItems.length > 0 ? (
                            pageItems.map((row) => {
                                const selected = selectedUnprocessedId === row.id;

                                return (
                                    <TableRow key={row.id} className={cn(selected && "bg-muted/50")}>
                                        <TableCell
                                            className={cn(dataTableBodyCellClassName, selectionColumnClassName)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                disabled={disabled}
                                                onChange={() => toggleUnprocessedSelection(row.id)}
                                                aria-label={`Выбрать сигнал ${row.description}`}
                                                className="size-4 rounded border-input"
                                            />
                                        </TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.description}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>
                                            {row.detectedAt || "—"}
                                        </TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>
                                            {row.endedAt || "—"}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className={cn(
                                        dataTableBodyCellClassName,
                                        "py-6 text-center text-muted-foreground",
                                    )}
                                >
                                    Нет необработанных сигналов
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </DataTablePanel>

            <div className="grid gap-2">
                <Label htmlFor="event-discard-comment" className={comboboxFieldLabelClassName}>
                    Комментарий
                </Label>
                <div className="relative">
                    <textarea
                        id="event-discard-comment"
                        value={deleteComment}
                        disabled={disabled}
                        onChange={(e) => setDeleteComment(e.target.value)}
                        placeholder="Укажите причину удаления выбранного сигнала"
                        rows={3}
                        className={textareaClass}
                    />
                    <div className="mt-2 flex justify-end">
                        <Button
                            type="button"
                            size="sm"
                            pending={isDiscardSignalsPending}
                            pendingLabel="Удаление…"
                            disabled={disabled || !canDeleteSelectedSignals}
                            onClick={() => void deleteSelectedSignals()}
                        >
                            Удалить
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
