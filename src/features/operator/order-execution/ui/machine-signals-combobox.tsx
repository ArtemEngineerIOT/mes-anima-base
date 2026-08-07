import { useId, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, X } from "lucide-react";

import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { DataTableViewport } from "@/shared/ui/kit/data-table-viewport";
import { Informer } from "@/shared/ui/kit/informer";
import { Label } from "@/shared/ui/kit/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import {
    dataTableBodyCellClassName,
    dataTableHeadCellClassName,
    dataTableInsetShellClassName,
    dataTableSplitScrollBodyClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import {
    formatReleaseProductionEventCellValue,
    getReleaseProductionEventCellValue,
} from "../model/release/map-event-release-production-payload";
import {
    RELEASE_PRODUCTION_EVENT_VISIBLE_COLUMNS,
    type ReleaseProductionEventListRow,
} from "../model/release/production-event-types";
import {
    sortReleaseProductionEventList,
    type ReleaseProductionEventSortColumn,
    type ReleaseProductionEventSortDirection,
} from "../model/release/sort-release-production-events-by-registered-at";

const selectionColumnClassName = "w-10";
const timeColumnClassName = "w-[9.25rem] shrink-0 whitespace-nowrap";

/** Число строк тела в выпадающем списке (~max-h-60 с учётом шапки). */
const COMBOBOX_VISIBLE_BODY_ROWS = 5;

const SORTABLE_COLUMNS = new Set<ReleaseProductionEventSortColumn>(["registered_at", "length_m"]);

type SortState = {
    column: ReleaseProductionEventSortColumn;
    direction: ReleaseProductionEventSortDirection;
};

function SortDirectionIcon({ direction }: { direction: ReleaseProductionEventSortDirection }) {
    const IconComponent = direction === "asc" ? ArrowUp : ArrowDown;

    return <IconComponent className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />;
}

function resolveSortAriaLabel(column: ReleaseProductionEventSortColumn, direction: ReleaseProductionEventSortDirection): string {
    const sortLabel = direction === "asc" ? "по возрастанию" : "по убыванию";

    if (column === "length_m") {
        return `Сортировать по длине: ${sortLabel}`;
    }

    return `Сортировать по времени: ${sortLabel}`;
}

function resolveColumnHeaderLabel(columnKey: string, label: string): string {
    if (columnKey === "registered_at") {
        return label.toLocaleUpperCase("ru-RU");
    }

    return label;
}

export type MachineSignalsComboboxProps = {
    rows: ReleaseProductionEventListRow[];
    emptyStateMessage?: string;
    isLoading: boolean;
    error: string | null;
    selectedSignalId: string | null;
    onToggleSignal: (rowId: string) => void;
    className?: string;
    fieldLabel?: string;
    placeholder?: string;
    loadingTitle?: string;
    errorTitle?: string;
};

function buildSignalSummary(row: ReleaseProductionEventListRow): string {
    const name = formatReleaseProductionEventCellValue(
        getReleaseProductionEventCellValue(row, "event_description"),
    );
    const time = formatReleaseProductionEventCellValue(
        getReleaseProductionEventCellValue(row, "registered_at"),
    );
    const length = formatReleaseProductionEventCellValue(
        getReleaseProductionEventCellValue(row, "length_m"),
    );

    return [name, time, length].filter(Boolean).join(" · ");
}

export function MachineSignalsCombobox({
    rows,
    emptyStateMessage,
    isLoading,
    error,
    selectedSignalId,
    onToggleSignal,
    className,
    fieldLabel = "Сигнал машины",
    placeholder = "Выберите сигнал машины",
    loadingTitle = "Загрузка сигналов…",
    errorTitle = "Сигналы с машины",
}: MachineSignalsComboboxProps) {
    const triggerId = useId();
    const [open, setOpen] = useState(false);
    const [sort, setSort] = useState<SortState>({ column: "registered_at", direction: "desc" });

    const sortedRows = useMemo(
        () => sortReleaseProductionEventList(rows, sort.column, sort.direction),
        [rows, sort.column, sort.direction],
    );

    const handleSortClick = (column: ReleaseProductionEventSortColumn) => {
        setSort((prev) =>
            prev.column === column
                ? { column, direction: prev.direction === "asc" ? "desc" : "asc" }
                : { column, direction: "desc" },
        );
    };

    const selectedRow = useMemo(
        () => rows.find((row) => row.id === selectedSignalId) ?? null,
        [rows, selectedSignalId],
    );

    const summary = selectedRow ? buildSignalSummary(selectedRow) : placeholder;

    const handleToggle = (rowId: string) => {
        const willSelect = selectedSignalId !== rowId;
        onToggleSignal(rowId);
        if (willSelect) {
            setOpen(false);
        }
    };

    const handleClear = () => {
        if (selectedSignalId) {
            onToggleSignal(selectedSignalId);
        }
    };

    if (isLoading) {
        return (
            <div className={className}>
                <Informer tone="system" variant="bordered" size="s" title={loadingTitle} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={className}>
                <Informer tone="alert" variant="bordered" size="s" title={errorTitle} description={error} />
            </div>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className={cn("flex min-w-0 flex-col", className)}>
                <Label
                    htmlFor={triggerId}
                    className={cn(comboboxFieldLabelClassName, "text-emerald-700 dark:text-emerald-400")}
                >
                    {fieldLabel}
                    <span className="text-destructive" aria-hidden>
                        {" "}
                        *
                    </span>
                </Label>
                <div className="mt-1 flex min-w-0 gap-1">
                    <PopoverTrigger asChild>
                        <Button
                            id={triggerId}
                            type="button"
                            variant="outline"
                            aria-required
                            className={cn(
                                "h-9 min-w-0 flex-1 justify-between gap-2 border-emerald-500 bg-emerald-50 px-3 font-normal text-emerald-950",
                                "hover:bg-emerald-100 hover:text-emerald-950",
                                "dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-50 dark:hover:bg-emerald-950/60",
                                "focus-visible:border-emerald-600 focus-visible:ring-emerald-500/40",
                            )}
                        >
                            <span
                                className={cn(
                                    "min-w-0 truncate text-left text-sm",
                                    !selectedRow && "text-emerald-700/70 dark:text-emerald-300/70",
                                )}
                            >
                                {summary}
                            </span>
                            <ChevronDown className="size-4 shrink-0 text-emerald-700 opacity-70 dark:text-emerald-300" aria-hidden />
                        </Button>
                    </PopoverTrigger>
                    {selectedSignalId ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className={cn(
                                "shrink-0 border-emerald-500 bg-emerald-50 text-emerald-950",
                                "hover:bg-emerald-100 hover:text-emerald-950",
                                "dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-50",
                            )}
                            aria-label="Снять выбор сигнала"
                            onClick={(event) => {
                                event.preventDefault();
                                handleClear();
                            }}
                        >
                            <X className="size-4" aria-hidden />
                        </Button>
                    ) : null}
                </div>

                <PopoverContent
                    align="start"
                    className="w-[var(--radix-popover-trigger-width)] min-w-[480px] p-0"
                    onOpenAutoFocus={(event) => {
                        event.preventDefault();
                    }}
                >
                    <DataTableViewport
                        visibleBodyRows={COMBOBOX_VISIBLE_BODY_ROWS}
                        className="rounded-none border-0 shadow-none"
                    >
                        <Table
                            className={cn(
                                dataTableInsetShellClassName,
                                "min-w-[460px] border-separate border-spacing-0 text-[12px]",
                            )}
                        >
                            <TableHeader>
                                <TableRow className="hover:!bg-transparent">
                                    <TableHead
                                        className={cn(
                                            dataTableHeadCellClassName,
                                            "bg-muted/40",
                                            selectionColumnClassName,
                                        )}
                                        aria-label="Выбор сигнала"
                                    />
                                    {RELEASE_PRODUCTION_EVENT_VISIBLE_COLUMNS.map((column) => {
                                        const headerLabel = resolveColumnHeaderLabel(column.key, column.label);
                                        const isSortable = SORTABLE_COLUMNS.has(
                                            column.key as ReleaseProductionEventSortColumn,
                                        );

                                        if (isSortable) {
                                            const sortColumn = column.key as ReleaseProductionEventSortColumn;
                                            const isActiveSort = sort.column === sortColumn;

                                            return (
                                                <TableHead
                                                    key={column.key}
                                                    className={cn(
                                                        dataTableHeadCellClassName,
                                                        "bg-muted/40",
                                                        column.key === "length_m" && "text-right",
                                                        column.key === "registered_at" && timeColumnClassName,
                                                    )}
                                                    aria-sort={
                                                        isActiveSort
                                                            ? sort.direction === "asc"
                                                                ? "ascending"
                                                                : "descending"
                                                            : "none"
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            "inline-flex items-center gap-1 hover:text-foreground",
                                                            column.key === "registered_at" &&
                                                                "text-left uppercase whitespace-nowrap",
                                                            column.key === "length_m" && "ml-auto",
                                                        )}
                                                        onClick={() => {
                                                            handleSortClick(sortColumn);
                                                        }}
                                                        aria-label={resolveSortAriaLabel(
                                                            sortColumn,
                                                            isActiveSort ? sort.direction : "desc",
                                                        )}
                                                    >
                                                        <span>{headerLabel}</span>
                                                        {isActiveSort ? (
                                                            <SortDirectionIcon direction={sort.direction} />
                                                        ) : (
                                                            <ArrowDown
                                                                className="size-3.5 shrink-0 text-muted-foreground/50"
                                                                aria-hidden
                                                            />
                                                        )}
                                                    </button>
                                                </TableHead>
                                            );
                                        }

                                        return (
                                            <TableHead
                                                key={column.key}
                                                className={cn(dataTableHeadCellClassName, "bg-muted/40")}
                                            >
                                                {headerLabel}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            </TableHeader>
                            <TableBody className={dataTableSplitScrollBodyClassName}>
                                {sortedRows.length > 0 ? (
                                    sortedRows.map((row) => {
                                        const isSelected = selectedSignalId === row.id;
                                        const eventDescription = formatReleaseProductionEventCellValue(
                                            getReleaseProductionEventCellValue(row, "event_description"),
                                        );

                                        return (
                                            <TableRow
                                                key={row.id}
                                                className={cn(isSelected && "bg-muted/50")}
                                            >
                                                <TableCell
                                                    className={cn(
                                                        dataTableBodyCellClassName,
                                                        selectionColumnClassName,
                                                    )}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {
                                                            handleToggle(row.id);
                                                        }}
                                                        aria-label={`Выбрать сигнал ${eventDescription}`}
                                                        className="size-4 rounded border-input"
                                                    />
                                                </TableCell>
                                                {RELEASE_PRODUCTION_EVENT_VISIBLE_COLUMNS.map((column) => {
                                                    const cellValue = getReleaseProductionEventCellValue(
                                                        row,
                                                        column.key,
                                                    );

                                                    return (
                                                        <TableCell
                                                            key={`${row.id}-${column.key}`}
                                                            className={cn(
                                                                dataTableBodyCellClassName,
                                                                column.key === "length_m" && "text-right",
                                                                column.key === "registered_at" && timeColumnClassName,
                                                                column.key === "event_description" &&
                                                                    "max-w-[180px] truncate",
                                                            )}
                                                            title={
                                                                column.key === "event_description"
                                                                    ? formatReleaseProductionEventCellValue(
                                                                          cellValue,
                                                                      )
                                                                    : undefined
                                                            }
                                                        >
                                                            {formatReleaseProductionEventCellValue(cellValue)}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={RELEASE_PRODUCTION_EVENT_VISIBLE_COLUMNS.length + 1}
                                            className={cn(
                                                dataTableBodyCellClassName,
                                                "py-6 text-center text-muted-foreground",
                                            )}
                                        >
                                            {emptyStateMessage || "Нет необработанных сигналов"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DataTableViewport>
                </PopoverContent>
            </div>
        </Popover>
    );
}
