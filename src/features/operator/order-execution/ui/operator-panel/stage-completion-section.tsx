import { Fragment, useState } from "react";

import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { Icon } from "@/shared/ui/kit/icon";
import {
    dataTableBodyCellClassName,
    dataTableHeadCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
    dataTableStickyHeadCellOnBackgroundClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { Informer } from "@/shared/ui/kit/informer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import { useStageCompletion } from "../../model/use-stage-completion";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionSuspendedStageModal } from "../modal/order-execution-suspended-stage-modal";
import { StageCompletionPendingEventsTable } from "./stage-completion-pending-events-table";

type OrderExecutionStageCompletionSectionProps = {
    workAreaId?: string;
};

const blockTitleClass = cnSectionBlockTitle("pb-2");

function formatNumber(value: number): string {
    return value.toLocaleString("ru-RU");
}

export function OrderExecutionStageCompletionSection({ workAreaId }: OrderExecutionStageCompletionSectionProps) {
    const [expanded, setExpanded] = useState(false);
    const m = useStageCompletion({ workAreaId, enabled: expanded });
    const [suspendedModalOpen, setSuspendedModalOpen] = useState(false);
    const { snapshot } = m;

    const headerTone =
        m.completionHints.length > 0 && !m.stageCompleted
            ? ("alert" as const)
            : m.stageCompleted
              ? ("success" as const)
              : undefined;
    const headerCount =
        m.stageCompleted ? undefined : m.completionHints.length > 0 ? m.completionHints.length : undefined;

    const handleCompleteStageClick = () => {
        if (!m.canSubmitPrerequisites || m.stageCompleted) return;
        void m.tryFinalizeStage().then((result) => {
            if (result.showSuspendedModal) {
                setSuspendedModalOpen(true);
            }
        });
    };

    const blockingDescription =
        m.completionHints.length === 1
            ? m.completionHints[0]
            : m.completionHints.length > 1
              ? (
                    <ul className="list-disc space-y-1 pl-4">
                        {m.completionHints.map((hint) => (
                            <li key={hint}>{hint}</li>
                        ))}
                    </ul>
                )
              : "Завершение этапа сейчас недоступно.";

    return (
        <>
            <OrderExecutionCollapsibleSection
                title="Завершить этап"
                defaultOpen={false}
                tone={headerTone}
                count={headerCount}
                keepMounted
                onExpandedChange={setExpanded}
            >
                <div className="flex flex-col gap-5">
                    {m.initError ? (
                        <Informer
                            tone="alert"
                            variant="bordered"
                            size="s"
                            title="Ошибка загрузки"
                            description={m.initError}
                        />
                    ) : null}

                    {m.stageCompleted ? (
                        <Informer
                            tone="success"
                            variant="filled"
                            size="s"
                            title="Этап завершён"
                            description="Дальнейшие операции по заказу в MES заблокированы. Данные переданы в 1С (макет до интеграции)."
                        />
                    ) : null}

                    <div>
                        <div className={blockTitleClass}>История операций по этапу</div>
                    </div>

                    <div>
                        <div className={cnSectionBlockTitle("pb-2 text-[11px]")}>Входящие рулоны</div>
                        <div className={dataTableScrollViewportClassName}>
                            <Table className={cn(dataTableShellClassName, "min-w-[760px]", "text-[12px]")}>
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Номенклатура</TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Номенклатура</TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Серия</TableHead>
                                        <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>
                                            Количество
                                        </TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Ед. изм.</TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Машина</TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Статус</TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>FR</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {snapshot.incomingRolls.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className={
                                                row.blocked
                                                    ? "!bg-destructive/15 hover:!bg-destructive/25 dark:!bg-destructive/20"
                                                    : undefined
                                            }
                                        >
                                            <TableCell className={dataTableBodyCellClassName}>{row.material}</TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>
                                                {row.nomenclature}
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>{row.series}</TableCell>
                                            <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                                {formatNumber(row.quantity)}
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>{row.unit}</TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>{row.machine}</TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>{row.status}</TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>{row.fr}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div>
                        <div className={cnSectionBlockTitle("pb-2 text-[11px]")}>Выпущенные серии</div>
                        <div className={dataTableScrollViewportClassName}>
                            <Table className={cn(dataTableShellClassName, "min-w-[760px]", "text-[12px]")}>
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Артикул</TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Номен.</TableHead>
                                        <TableHead className={cn(dataTableStickyHeadCellClassName, "text-center")}>
                                            Перемотка
                                        </TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Серия</TableHead>
                                        <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>
                                            Нетто
                                        </TableHead>
                                        <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>
                                            Брутто
                                        </TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Ед. изм. 1</TableHead>
                                        <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>
                                            Кол-во 1
                                        </TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>FR</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {snapshot.releasedSeries.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className={
                                                row.blocked
                                                    ? "!bg-destructive/15 hover:!bg-destructive/25 dark:!bg-destructive/20"
                                                    : undefined
                                            }
                                        >
                                            <TableCell className={dataTableBodyCellClassName}>{row.article}</TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>
                                                {row.nomenclature}
                                            </TableCell>
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
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="text-right text-[12px] font-bold uppercase text-foreground">
                        Расчётный брак: {snapshot.defectPercent}%
                    </div>

                    <div>
                        <div className={blockTitleClass}>Журнал событий</div>
                        <div className={dataTableScrollViewportClassName}>
                            <Table className={cn(dataTableShellClassName, "min-w-[640px]", "text-[12px]")}>
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
                                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-9")} />
                                        <TableHead className={dataTableStickyHeadCellClassName}>Код события</TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Начало</TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Конец</TableHead>
                                        <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>
                                            Метраж
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {snapshot.eventJournal.map((row) => {
                                        const isExpanded = m.expandedEventIds.has(row.id);
                                        const details = row.details ?? [];
                                        return (
                                            <Fragment key={row.id}>
                                                <TableRow>
                                                    <TableCell className={cn(dataTableBodyCellClassName, "w-9")}>
                                                        <button
                                                            type="button"
                                                            className="inline-flex h-7 w-7 items-center justify-center rounded-sm hover:bg-accent"
                                                            onClick={() => m.toggleExpandedEventId(row.id)}
                                                            aria-label={
                                                                isExpanded ? "Свернуть событие" : "Развернуть событие"
                                                            }
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
                                                    </TableCell>
                                                    <TableCell className={dataTableBodyCellClassName}>
                                                        {row.eventCode}
                                                    </TableCell>
                                                    <TableCell className={dataTableBodyCellClassName}>{row.start}</TableCell>
                                                    <TableCell className={dataTableBodyCellClassName}>{row.end}</TableCell>
                                                    <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                                        {formatNumber(row.meterage)}
                                                    </TableCell>
                                                </TableRow>
                                                {isExpanded ? (
                                                    <TableRow key={`${row.id}-details`} className="bg-muted/20">
                                                        <TableCell className={dataTableBodyCellClassName} />
                                                        <TableCell colSpan={4} className="p-0">
                                                            <div className="px-20 py-2">
                                                                <div className={dataTableScrollViewportClassName}>
                                                                    <Table
                                                                        className={cn(
                                                                            dataTableShellClassName,
                                                                            "border-0 text-[12px]",
                                                                        )}
                                                                    >
                                                                        <TableHeader className="bg-muted/40">
                                                                            <TableRow>
                                                                                <TableHead
                                                                                    className={
                                                                                        dataTableStickyHeadCellOnBackgroundClassName
                                                                                    }
                                                                                >
                                                                                    Параметр
                                                                                </TableHead>
                                                                                <TableHead
                                                                                    className={
                                                                                        dataTableStickyHeadCellOnBackgroundClassName
                                                                                    }
                                                                                >
                                                                                    Значение
                                                                                </TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {details.length > 0 ? (
                                                                                details.map((detail) => (
                                                                                    <TableRow key={detail.parameter}>
                                                                                        <TableCell
                                                                                            className={cn(
                                                                                                dataTableBodyCellClassName,
                                                                                                "text-muted-foreground",
                                                                                            )}
                                                                                        >
                                                                                            {detail.parameter}
                                                                                        </TableCell>
                                                                                        <TableCell
                                                                                            className={dataTableBodyCellClassName}
                                                                                        >
                                                                                            {detail.value}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                ))
                                                                            ) : (
                                                                                <TableRow>
                                                                                    <TableCell
                                                                                        colSpan={2}
                                                                                        className={cn(
                                                                                            dataTableBodyCellClassName,
                                                                                            "text-center text-muted-foreground",
                                                                                        )}
                                                                                    >
                                                                                        Нет деталей
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            )}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : null}
                                            </Fragment>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="mt-2 text-right text-[12px] font-bold uppercase text-foreground">
                            Метраж. Итого: {formatNumber(snapshot.totalEventMeterage)}
                        </div>
                    </div>

                    {!m.stageCompleted && m.completionHints.length > 0 ? (
                        <Informer
                            tone="warning"
                            variant="filled"
                            size="s"
                            title="Невозможно завершить этап"
                            description={blockingDescription}
                        />
                    ) : null}

                    <StageCompletionPendingEventsTable rows={snapshot.pendingEvents} />

                    <div className="grid gap-2">
                        <div className={cn(dataTableHeadCellClassName, "px-0")}>Комментарий</div>
                        {m.submitError ? (
                            <Informer
                                tone="alert"
                                variant="bordered"
                                size="s"
                                title="Ошибка завершения этапа"
                                description={m.submitError}
                            />
                        ) : null}
                        <textarea
                            className="min-h-16 w-full rounded-sm border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            placeholder="Заполните при необходимости"
                            value={m.comment}
                            onChange={(event) => m.setComment(event.target.value)}
                            disabled={m.stageCompleted || m.isSubmitting}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleCompleteStageClick}
                            pending={m.isSubmitting}
                            pendingLabel="Завершение…"
                            disabled={!m.canSubmitPrerequisites || m.stageCompleted}
                        >
                            Завершить этап
                        </Button>
                    </div>
                </div>
            </OrderExecutionCollapsibleSection>

            <OrderExecutionSuspendedStageModal
                open={suspendedModalOpen}
                onOpenChange={setSuspendedModalOpen}
                stageLabel={snapshot.suspendedStageLabel}
            />
        </>
    );
}
