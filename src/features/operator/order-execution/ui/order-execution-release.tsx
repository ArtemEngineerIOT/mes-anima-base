import { useRelease } from "../model/release/use-release";
import { Button } from "@/shared/ui/kit/button";
import { Icon } from "@/shared/ui/kit/icon";
import { Input } from "@/shared/ui/kit/input";
import { Informer } from "@/shared/ui/kit/informer";
import { cn } from "@/shared/lib/css";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

type OrderExecutionReleaseProps = {
    workAreaId?: string;
    enabled: boolean;
};

export function OrderExecutionRelease({ workAreaId, enabled }: OrderExecutionReleaseProps) {
    const {
        form,
        patchForm,
        setNetWeight,
        setBlockReason,
        series,
        warehouseOptions,
        batchRolls,
        batchAsOf,
        blockReasons,
        isLoading,
        error,
        canSubmitBlock,
        isSubmittingBlock,
        blockSubmitError,
        blockSubmitMessage,
        submitBlock,
        canRegisterRelease,
        isRegisteringRelease,
        registerSubmitError,
        registerSubmitMessage,
        registerRelease,
        printError,
        printingReleaseId,
        printReleaseLabel,
    } = useRelease({ workAreaId, enabled });

    if (!enabled) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            {error ? (
                <Informer tone="alert" variant="bordered" size="s" title="Ошибка загрузки" description={error} />
            ) : null}

            {isLoading ? (
                <Informer tone="system" variant="bordered" size="s" title="Загрузка данных выпуска…" />
            ) : null}

            <div className="space-y-2">
                <div className={cnSectionBlockTitle("pb-2")}>Данные по серии</div>
                <div className={dataTableScrollViewportClassName}>
                    <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "w-[45%]")}>
                                    Характеристика
                                </TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Значение</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>Серия</TableCell>
                                <TableCell className={dataTableBodyCellClassName}>{series || "—"}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="space-y-3">
                <div className={cnSectionBlockTitle("pb-2")}>Данные для выпуска</div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                        <div className={comboboxFieldLabelClassName}>Метраж</div>
                        <Input
                            className="mt-1"
                            value={form.lengthM}
                            disabled={isLoading || Boolean(error)}
                            onChange={(event) => patchForm({ lengthM: event.target.value })}
                        />
                    </div>
                    <div>
                        <div className={comboboxFieldLabelClassName}>Нетто</div>
                        <Input
                            className="mt-1"
                            value={form.netWeightKg}
                            disabled={isLoading || Boolean(error)}
                            onChange={(event) => setNetWeight(event.target.value)}
                        />
                    </div>
                    <div>
                        <div className={comboboxFieldLabelClassName}>Брутто = нетто</div>
                        <Input
                            className="mt-1 bg-muted/40"
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
                            disabled={isLoading || Boolean(error) || warehouseOptions.length === 0}
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
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 pb-2">
                    <div className={cnSectionBlockTitle()}>Выпуски партии</div>
                    {batchAsOf ? (
                        <span className="shrink-0 text-[11px] text-muted-foreground">Актуально на {batchAsOf}</span>
                    ) : null}
                </div>
                {printError ? <div className="text-[12px] text-destructive">{printError}</div> : null}
                <div className={dataTableScrollViewportClassName}>
                    <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className={dataTableStickyHeadCellClassName}>Штрихкод</TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[200px]")}>
                                    Номенклатура
                                </TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>Кол-во 1</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Ед. изм. 1</TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>Кол-во 2</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Ед. изм. 2</TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "w-12 text-right")} />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batchRolls.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className={cn(dataTableBodyCellClassName, "text-center text-muted-foreground")}
                                    >
                                        Нет выпусков партии
                                    </TableCell>
                                </TableRow>
                            ) : (
                                batchRolls.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className={cn(row.blocked && "bg-destructive/10 text-destructive")}
                                    >
                                        <TableCell className={dataTableBodyCellClassName}>{row.barcode}</TableCell>
                                        <TableCell
                                            className={cn(dataTableBodyCellClassName, "max-w-[280px] truncate")}
                                            title={row.nomenclature}
                                        >
                                            {row.nomenclature}
                                        </TableCell>
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="space-y-3">
                <div className={cnSectionBlockTitle("pb-2")}>Причины блокировки</div>
                {blockSubmitMessage ? (
                    <Informer tone="success" variant="filled" size="s" title={blockSubmitMessage} />
                ) : null}
                <div>
                    <div className={comboboxFieldLabelClassName}>Выберите причину</div>
                    <select
                        className="mt-1 h-9 w-full rounded-sm border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                        value={form.blockReason}
                        disabled={isLoading || Boolean(error) || blockReasons.length === 0}
                        onChange={(event) => setBlockReason(event.target.value)}
                    >
                        {blockReasons.map((reason) => (
                            <option key={reason.reasonCode} value={reason.reasonCode}>
                                {reason.reasonLabel}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <div className={comboboxFieldLabelClassName}>Комментарий для склада</div>
                    <textarea
                        className="mt-1 min-h-20 w-full rounded-sm border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                        value={form.warehouseComment}
                        disabled={isLoading || Boolean(error)}
                        onChange={(event) => patchForm({ warehouseComment: event.target.value })}
                    />
                </div>
                <div className="flex flex-col items-end gap-2">
                    {blockSubmitError ? (
                        <div className="w-full text-[12px] text-destructive">{blockSubmitError}</div>
                    ) : null}
                    <Button
                        type="button"
                        size="sm"
                        pending={isSubmittingBlock}
                        pendingLabel="Передача…"
                        disabled={!canSubmitBlock || isLoading || Boolean(error) || isSubmittingBlock}
                        onClick={() => {
                            void submitBlock();
                        }}
                    >
                        Передать блокировки
                    </Button>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                {registerSubmitError ? (
                    <div className="w-full text-[12px] text-destructive">{registerSubmitError}</div>
                ) : null}
                {registerSubmitMessage ? (
                    <Informer tone="success" variant="filled" size="s" title={registerSubmitMessage} className="w-full" />
                ) : null}
                <Button
                    type="button"
                    size="sm"
                    pending={isRegisteringRelease}
                    pendingLabel="Регистрация…"
                    disabled={!canRegisterRelease || isLoading || Boolean(error) || isRegisteringRelease}
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
