import { Fragment, useMemo, useState } from "react";

import { cn } from "@/shared/lib/css";
import { Icon } from "@/shared/ui/kit/icon";
import { Informer } from "@/shared/ui/kit/informer";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
    dataTableStickyHeadCellOnBackgroundClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import { useEventRegistrationContext } from "../../model/event-registration/event-registration-context";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";

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

    const totalLengthLabel = useMemo(() => formatTotalLength(totalLengthM), [totalLengthM]);

    return (
        <OrderExecutionCollapsibleSection
            title="Журнал процесса"
            defaultOpen={false}
            tone="warning"
            onExpandedChange={onExpandedChange}
        >
            <div className="grid gap-3">
                {journalLoadError ? (
                    <Informer tone="alert" variant="bordered" size="s" title="Ошибка загрузки" description={journalLoadError} />
                ) : null}

                {isJournalLoading ? (
                    <Informer tone="system" variant="bordered" size="s" title="Загрузка журнала процесса…" />
                ) : null}

                <div className={dataTableScrollViewportClassName}>
                    <Table className={cn(dataTableShellClassName, "min-w-[640px]", "text-[12px]")}>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:!bg-transparent">
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "w-9")} />
                                <TableHead className={dataTableStickyHeadCellClassName}>Код события</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Начало</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Конец</TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>Метраж</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {journal.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className={cn(dataTableBodyCellClassName, "py-4 text-center text-muted-foreground")}
                                    >
                                        События ещё не зарегистрированы
                                    </TableCell>
                                </TableRow>
                            ) : (
                                journal.map((row) => {
                                    const isExpanded = expandedRowId === row.id;
                                    const hasDetails = Boolean(row.details && row.details.length > 0);

                                    return (
                                        <Fragment key={row.id}>
                                            <TableRow>
                                                <TableCell className={cn(dataTableBodyCellClassName, "w-9")}>
                                                    {hasDetails ? (
                                                        <button
                                                            type="button"
                                                            className="inline-flex h-7 w-7 items-center justify-center rounded-sm hover:bg-accent"
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
                                                <TableRow className="bg-muted/20">
                                                    <TableCell className={dataTableBodyCellClassName} />
                                                    <TableCell colSpan={4} className="p-0">
                                                        <div className="px-20 py-2">
                                                            <div className={dataTableScrollViewportClassName}>
                                                                <Table className={cn(dataTableShellClassName, "border-0 text-[12px]")}>
                                                                    <TableHeader className="bg-muted/40">
                                                                        <TableRow className="hover:!bg-transparent">
                                                                            <TableHead
                                                                                className={dataTableStickyHeadCellOnBackgroundClassName}
                                                                            >
                                                                                Параметр
                                                                            </TableHead>
                                                                            <TableHead
                                                                                className={dataTableStickyHeadCellOnBackgroundClassName}
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
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : null}
                                        </Fragment>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="text-right text-[12px] font-bold uppercase text-foreground">
                    Метраж. Итого: {totalLengthLabel}
                </div>
            </div>
        </OrderExecutionCollapsibleSection>
    );
}
