import { useEffect, useMemo, type MutableRefObject } from "react";

import { useDataTablePagination } from "@/shared/lib/data-table-pagination";
import { useOrderExecutionMachineStompState } from "../model/machine-stomp/order-execution-machine-stomp-context";
import { resolveMachineStompPanelTone } from "../model/machine-stomp/resolve-machine-stomp-panel-tone";
import type { ReleaseProductionEventsSummarySnapshot } from "../model/release/production-events-summary/types";
import { useRelease } from "../model/release/use-release";
import { MachineSignalsCombobox } from "@/features/operator/order-execution/ui/machine-signals-combobox";
import { FloatingAutoDismissInformer } from "@/shared/ui/kit/floating-auto-dismiss-informer";
import { Button } from "@/shared/ui/kit/button";
import { DataTablePaginationFooter } from "@/shared/ui/kit/data-table-pagination-footer";
import { Icon } from "@/shared/ui/kit/icon";
import { Input } from "@/shared/ui/kit/input";
import { Informer } from "@/shared/ui/kit/informer";
import { Label } from "@/shared/ui/kit/label";
import { MachineDataPanel } from "@/shared/ui/kit/machine-data-panel";
import { cn } from "@/shared/lib/css";
import {
    dataTableBodyCellClassName,
    dataTableInsetShellClassName,
    dataTableStickyHeadCellClassName,
    dataTableViewportFooterClassName,
    dataTableViewportShellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

type OrderExecutionReleaseProps = {
    workAreaId?: string;
    enabled: boolean;
    eventsSummary?: ReleaseProductionEventsSummarySnapshot;
    onReleaseRegistered?: () => void;
    /** Регистрирует silent-reload списка сигналов выпуска */
    productionEventsSilentReloadRef?: MutableRefObject<(() => void) | null>;
};

const batchRollSelectionColumnClassName = "w-10";
const headCellClassName = dataTableStickyHeadCellClassName;

export function OrderExecutionRelease({
    workAreaId,
    enabled,
    eventsSummary,
    onReleaseRegistered,
    productionEventsSilentReloadRef,
}: OrderExecutionReleaseProps) {
    const {
        form,
        patchForm,
        setNetWeight,
        series,
        warehouseOptions,
        batchRolls,
        batchAsOf,
        selectedBatchRollIds,
        toggleBatchRollSelection,
        blockReasons,
        isBlockReasonsLoading,
        blockReasonsError,
        reloadBlockReasons,
        selectedBlockReasonCode,
        selectBlockReason,
        blockComment,
        setBlockComment,
        canSubmitBlock,
        isSubmittingBlock,
        panelFeedback,
        dismissPanelFeedback,
        submitBatchBlock,
        isLoading,
        error,
        canRegisterRelease,
        isRegisteringRelease,
        registerRelease,
        printError,
        printingReleaseId,
        printReleaseLabel,
        productionEvent,
        isProductionEventLoading,
        productionEventError,
        selectedProductionEventId,
        toggleProductionEventSignal,
        reloadProductionEventsSilent,
    } = useRelease({ workAreaId, enabled, onReleaseRegistered });

    useEffect(() => {
        if (!productionEventsSilentReloadRef) {
            return;
        }

        productionEventsSilentReloadRef.current = () => {
            reloadProductionEventsSilent();
        };

        return () => {
            productionEventsSilentReloadRef.current = null;
        };
    }, [productionEventsSilentReloadRef, reloadProductionEventsSilent]);

    const machineStompState = useOrderExecutionMachineStompState();

    const eventsSummaryRows = useMemo(
        () =>
            eventsSummary?.fields.map((field) => ({
                characteristic: field.label,
                value: String(field.value),
                unit: "",
            })) ?? [],
        [eventsSummary?.fields],
    );

    const eventsSummaryTone = resolveMachineStompPanelTone(machineStompState);

    /** Плашка и комбобокс сигналов — только если есть необработанные сигналы с машины */
    const hasMachineSignals =
        productionEvent.eventList.length > 0 || (eventsSummary?.unprocessedCount ?? 0) > 0;

    const showSignalsCombobox =
        hasMachineSignals || isProductionEventLoading || Boolean(productionEventError);

    const {
        pageItems: batchPageItems,
        pagination: batchPagination,
        pageSize: batchPageSize,
        setPageSize: setBatchPageSize,
        setPage: setBatchPage,
    } = useDataTablePagination(batchRolls, { initialPageSize: 5 });

    if (!enabled) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            {hasMachineSignals ? (
                <MachineDataPanel
                    title="Данные с машин"
                    rows={eventsSummaryRows}
                    tone={eventsSummaryTone}
                    emptyText="Нет данных сводки"
                    updatedAt={eventsSummary?.changedAt}
                    updatedAtLabel="Обновлено"
                    showUnitColumn={false}
                />
            ) : null}

            {error ? (
                <Informer tone="alert" variant="bordered" size="s" title="Ошибка загрузки" description={error} />
            ) : null}

            {isLoading ? (
                <Informer tone="system" variant="bordered" size="s" title="Загрузка данных выпуска…" />
            ) : null}

            <div className="grid gap-3">
                <div className={cnSectionBlockTitle()}>Данные по серии</div>
                <div className={dataTableViewportShellClassName}>
                    <div className="min-w-0 overflow-x-auto">
                        <Table
                            className={cn(
                                dataTableInsetShellClassName,
                                "min-w-[480px] border-separate border-spacing-0 text-[12px]",
                            )}
                        >
                            <TableHeader className="bg-muted/40">
                                <TableRow className="hover:!bg-transparent">
                                    <TableHead className={cn(headCellClassName, "w-[45%]")}>Характеристика</TableHead>
                                    <TableHead className={headCellClassName}>Значение</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>
                                        Серия
                                    </TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{series || "—"}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className={cnSectionBlockTitle("pb-2")}>Данные для выпуска</div>

                {showSignalsCombobox ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                        <MachineSignalsCombobox
                            rows={productionEvent.eventList}
                            emptyStateMessage={productionEvent.emptyStateMessage}
                            isLoading={isProductionEventLoading}
                            error={productionEventError}
                            selectedSignalId={selectedProductionEventId}
                            onToggleSignal={toggleProductionEventSignal}
                            fieldLabel="Сигналы с машин"
                            placeholder="Выберите сигнал с машины"
                            loadingTitle="Загрузка сигналов выпуска…"
                            errorTitle="Сигналы выпуска"
                        />
                    </div>
                ) : null}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                        <div className={comboboxFieldLabelClassName}>Метраж</div>
                        <Input
                            className="mt-1"
                            inputMode="decimal"
                            value={form.lengthM}
                            disabled={isLoading || Boolean(error)}
                            onChange={(event) => patchForm({ lengthM: event.target.value })}
                        />
                    </div>
                    <div>
                        <div className={comboboxFieldLabelClassName}>Нетто</div>
                        <Input
                            className="mt-1"
                            inputMode="decimal"
                            value={form.netWeightKg}
                            disabled={isLoading || Boolean(error)}
                            onChange={(event) => setNetWeight(event.target.value)}
                        />
                    </div>
                    <div>
                        <div className={comboboxFieldLabelClassName}>Брутто = нетто</div>
                        <Input
                            className="mt-1 bg-muted/40"
                            inputMode="decimal"
                            value={form.grossWeightKg}
                            readOnly
                            tabIndex={-1}
                            aria-readonly
                        />
                    </div>
                    <div>
                        <div className={comboboxFieldLabelClassName}>Отправить на склад</div>
                        <select
                            className="mt-1 h-9 w-full rounded-sm border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                            value={form.warehouse}
                            disabled={
                                isLoading ||
                                Boolean(error) ||
                                warehouseOptions.length === 0
                            }
                            onChange={(event) => patchForm({ warehouse: event.target.value })}
                        >
                            {warehouseOptions.map((option) => (
                                <option key={option.warehouseCode} value={option.warehouseCode}>
                                    {option.warehouseLabel}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <label className="flex h-9 items-center gap-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            checked={form.requiresRewind}
                            disabled={isLoading || Boolean(error)}
                            onChange={(event) => patchForm({ requiresRewind: event.target.checked })}
                            className="h-4 w-4 accent-primary"
                        />
                        Требуется перемотка
                    </label>
                    <label className="flex h-9 items-center gap-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            checked={form.isLastRoll}
                            disabled={isLoading || Boolean(error)}
                            onChange={(event) => patchForm({ isLastRoll: event.target.checked })}
                            className="h-4 w-4 accent-primary"
                        />
                        Последний рулон
                    </label>
                </div>
            </div>

            <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                    <div className={cnSectionBlockTitle()}>Выпуски партии</div>
                    {batchAsOf ? (
                        <span className="shrink-0 text-[11px] text-muted-foreground">Актуально на {batchAsOf}</span>
                    ) : null}
                </div>
                {printError ? <div className="text-[12px] text-destructive">{printError}</div> : null}
                <div className={dataTableViewportShellClassName}>
                    <div className="overflow-x-auto min-w-0">
                        <Table
                            className={cn(
                                dataTableInsetShellClassName,
                                "min-w-[720px] border-separate border-spacing-0 text-[12px]",
                            )}
                        >
                            <TableHeader className="bg-muted/40">
                                <TableRow className="hover:!bg-transparent">
                                    <TableHead
                                        className={cn(headCellClassName, batchRollSelectionColumnClassName)}
                                        aria-label="Выбор выпуска"
                                    />
                                    <TableHead className={cn(headCellClassName, "min-w-[200px]")}>
                                        Номенклатура
                                    </TableHead>
                                    <TableHead className={headCellClassName}>Серия</TableHead>
                                    <TableHead className={cn(headCellClassName, "text-right")}>Кол-во 1</TableHead>
                                    <TableHead className={headCellClassName}>Ед. изм. 1</TableHead>
                                    <TableHead className={cn(headCellClassName, "text-right")}>Кол-во 2</TableHead>
                                    <TableHead className={headCellClassName}>Ед. изм. 2</TableHead>
                                    <TableHead
                                        className={cn(headCellClassName, "w-12 text-right")}
                                        aria-label="Печать этикетки"
                                    />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batchPageItems.length > 0 ? (
                                    batchPageItems.map((row) => {
                                        const isRowSelectable = row.externalSeriesKey.trim() !== "";
                                        const isSelected = selectedBatchRollIds.has(row.id);

                                        return (
                                        <TableRow
                                            key={row.id}
                                            className={cn(
                                                row.blocked && "bg-destructive/10 text-destructive",
                                                isSelected && "bg-muted/50",
                                            )}
                                        >
                                            <TableCell
                                                className={cn(
                                                    dataTableBodyCellClassName,
                                                    batchRollSelectionColumnClassName,
                                                )}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    disabled={isLoading || Boolean(error) || !isRowSelectable}
                                                    onChange={() => {
                                                        toggleBatchRollSelection(row.id);
                                                    }}
                                                    aria-label={`Выбрать выпуск ${row.barcode}`}
                                                    className="size-4 rounded border-input"
                                                />
                                            </TableCell>
                                            <TableCell
                                                className={cn(dataTableBodyCellClassName, "max-w-[280px] truncate")}
                                                title={row.nomenclature}
                                            >
                                                {row.nomenclature}
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>{row.barcode}</TableCell>
                                            <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                                {row.qty1}
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>{row.unit1}</TableCell>
                                            <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                                {row.qty2}
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>{row.unit2}</TableCell>
                                            <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon-sm"
                                                        className="size-7 shrink-0"
                                                        disabled={
                                                            isLoading ||
                                                            Boolean(error) ||
                                                            !row.materialProductionReleaseId ||
                                                            printingReleaseId === row.materialProductionReleaseId
                                                        }
                                                        aria-label={`Печать этикетки: ${row.barcode}`}
                                                        onClick={() => {
                                                            void printReleaseLabel(row.materialProductionReleaseId);
                                                        }}
                                                    >
                                                        <Icon name="print" size="sm" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className={cn(
                                                dataTableBodyCellClassName,
                                                "py-6 text-center text-muted-foreground",
                                            )}
                                        >
                                            Нет выпусков партии
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className={dataTableViewportFooterClassName}>
                        <DataTablePaginationFooter
                            totalCount={batchPagination.totalCount}
                            rangeStart={batchPagination.rangeStart}
                            rangeEnd={batchPagination.rangeEnd}
                            page={batchPagination.page}
                            totalPages={batchPagination.totalPages}
                            pageSize={batchPageSize}
                            onPageChange={setBatchPage}
                            onPageSizeChange={setBatchPageSize}
                        />
                    </div>
                </div>

                <section className="flex flex-col gap-3 border-t border-border pt-3">
                    <div className={cnSectionBlockTitle()}>Причины блокировки</div>
                    <div className="grid gap-2">
                        <div className={comboboxFieldLabelClassName}>Выберите причину</div>
                        {blockReasonsError ? (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[12px] text-destructive">{blockReasonsError}</span>
                                <Button type="button" size="sm" variant="outline" onClick={() => void reloadBlockReasons()}>
                                    Повторить
                                </Button>
                            </div>
                        ) : null}
                        <select
                            className="h-9 w-full rounded-sm border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedBlockReasonCode ?? ""}
                            disabled={isBlockReasonsLoading || blockReasons.length === 0 || isLoading || Boolean(error)}
                            onChange={(event) => selectBlockReason(event.target.value || null)}
                        >
                            <option value="">
                                {isBlockReasonsLoading ? "Загрузка…" : "Не выбрано"}
                            </option>
                            {blockReasons.map((reason) => (
                                <option key={reason.reasonCode} value={reason.reasonCode}>
                                    {reason.reasonLabel}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="release-block-comment">Комментарий для склада</Label>
                        <textarea
                            id="release-block-comment"
                            rows={3}
                            value={blockComment}
                            disabled={isLoading || Boolean(error)}
                            onChange={(event) => setBlockComment(event.target.value)}
                            className={cn(
                                "border-input bg-background placeholder:text-muted-foreground min-h-[72px] w-full resize-y rounded-sm border px-3 py-2 text-sm shadow-xs outline-none",
                                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            )}
                        />
                    </div>
                    {panelFeedback ? (
                        <FloatingAutoDismissInformer
                            key={panelFeedback.key}
                            tone={panelFeedback.tone}
                            variant="bordered"
                            size="s"
                            title={panelFeedback.title}
                            description={panelFeedback.description}
                            onDismiss={dismissPanelFeedback}
                        />
                    ) : null}
                    <div className="flex flex-col items-end gap-2">
                        <Button
                            type="button"
                            size="sm"
                            pending={isSubmittingBlock}
                            pendingLabel="Передача…"
                            disabled={!canSubmitBlock || isSubmittingBlock || isLoading || Boolean(error)}
                            onClick={() => {
                                void submitBatchBlock();
                            }}
                        >
                            Передать блокировки
                        </Button>
                    </div>
                </section>
            </div>

            <div className="flex flex-col items-end gap-2">
                <Button
                    type="button"
                    size="sm"
                    pending={isRegisteringRelease}
                    pendingLabel="Регистрация…"
                    disabled={
                        !canRegisterRelease ||
                        isLoading ||
                        Boolean(error) ||
                        isRegisteringRelease
                    }
                    onClick={() => {
                        void registerRelease();
                    }}
                >
                    Зарегистрировать выпуск
                </Button>
            </div>
        </div>
    );
}
