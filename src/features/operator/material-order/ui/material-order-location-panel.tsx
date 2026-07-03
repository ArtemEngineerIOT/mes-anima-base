import { useMemo } from "react";

import { Button } from "@/shared/ui/kit/button";
import { Icon } from "@/shared/ui/kit/icon";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { Informer } from "@/shared/ui/kit/informer";
import { InformerPill } from "@/shared/ui/kit/informer-pill";
import { MultiSelectCombobox } from "@/shared/ui/kit/multi-select-combobox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cn } from "@/shared/lib/css";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableStickyHeadCellClassName,
    dataTableShellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

import type { MaterialOrderSubmitOrderResultRow } from "../model/map-material-order-submit-payload";
import type { MaterialOrderWorkspaceModel } from "../model/use-material-order-workspace";

function submitOrderResultTone(status: string) {
    if (status.trim().toUpperCase() === "ACCEPTED") {
        return "success" as const;
    }
    return "alert" as const;
}

function submitOrderResultStatusLabel(row: MaterialOrderSubmitOrderResultRow) {
    if (row.requestStatus.trim()) {
        return row.requestStatus;
    }
    return "—";
}

type MaterialOrderLocationPanelProps = {
    workspace: MaterialOrderWorkspaceModel;
};

export function MaterialOrderLocationPanel({ workspace }: MaterialOrderLocationPanelProps) {
    const {
        machineOptions,
        nomenclatureOptions,
        locationFilterMachines,
        locationFilterKinds,
        locationLoading,
        locationError,
        locationPrintError,
        printingLocationSeriesRef,
        refreshLocation,
        printLocationRollLabel,
        toggleLocationMachine,
        isMachineOptionsLoading,
        machineOptionsError,
        toggleLocationKind,
        clearLocationKinds,
        locationQuery,
        setLocationQuery,
        locationRowsFiltered,
        locationSelectedIds,
        toggleLocationRow,
        selectedBlockReasonCode,
        selectBlockReason,
        blockComment,
        setBlockComment,
        blockReasons,
        blockReasonsLoading,
        blockReasonsError,
        reloadBlockReasons,
        selectedBlockSeriesRefs,
        isSubmittingBlock,
        blockSubmitError,
        blockSubmitMessage,
        submitBlock,
        submitStatus,
    } = workspace;

    const blockedNomenclatureLine = useMemo(() => {
        const rows = locationRowsFiltered.filter((r) => locationSelectedIds.has(r.id));
        if (!rows.length) return "—";
        return rows.map((r) => r.nomenclature).join(", ");
    }, [locationRowsFiltered, locationSelectedIds]);

    const canSubmitBlock = selectedBlockSeriesRefs.length > 0 && Boolean(selectedBlockReasonCode);

    return (
        <div className="flex flex-col gap-4">
            {submitStatus?.visible ? (
                <>
                    <Informer
                        tone="success"
                        variant="filled"
                        size="s"
                        title={submitStatus.title}
                        description={submitStatus.detail || undefined}
                    />
                    {submitStatus.orderResults.length > 0 ? (
                        <div className={dataTableScrollViewportClassName}>
                            <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Статус</TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Сообщение</TableHead>
                                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-20")}>Строк</TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Документ 1S</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submitStatus.orderResults.map((row, idx) => (
                                        <TableRow key={`${row.external1sDocumentRef}-${idx}`}>
                                            <TableCell className={dataTableBodyCellClassName}>
                                                <InformerPill
                                                    tone={submitOrderResultTone(row.requestStatus)}
                                                    variant="outline"
                                                >
                                                    {submitOrderResultStatusLabel(row)}
                                                </InformerPill>
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>
                                                {row.operatorMessage || row.errorMessage || "—"}
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>
                                                {row.lineCount ?? "—"}
                                            </TableCell>
                                            <TableCell className={cn(dataTableBodyCellClassName, "font-mono text-xs")}>
                                                {row.external1sDocumentRef || "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : null}
                </>
            ) : null}

            <section className="flex flex-col gap-3">
                <div className={cnSectionBlockTitle()}>Локация у машины</div>
                <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                        <MultiSelectCombobox
                            className="min-w-0 w-full"
                            fieldLabel="Машина"
                            options={machineOptions.map((m) => ({
                                value: m.resourceCode,
                                label: m.machine,
                            }))}
                            selected={locationFilterMachines}
                            onToggle={toggleLocationMachine}
                            placeholder={
                                isMachineOptionsLoading
                                    ? "Загрузка…"
                                    : machineOptionsError
                                      ? "Не удалось загрузить"
                                      : "Не выбрано"
                            }
                        />
                        <MultiSelectCombobox
                            className="min-w-0 w-full"
                            fieldLabel="Вид номенклатуры"
                            options={nomenclatureOptions.map((k) => ({ value: k.id, label: k.label }))}
                            selected={locationFilterKinds}
                            onToggle={toggleLocationKind}
                            onClear={clearLocationKinds}
                            clearAriaLabel="Снять выбор видов номенклатуры"
                            placeholder="Не выбрано"
                        />
                        <Button
                            type="button"
                            size="sm"
                            className="h-9 shrink-0"
                            disabled={
                                locationLoading ||
                                isMachineOptionsLoading ||
                                locationFilterMachines.length === 0
                            }
                            onClick={() => {
                                void refreshLocation();
                            }}
                        >
                            <Icon name="refresh" className="text-base" />
                            {locationLoading ? "Обновление…" : "Обновить"}
                        </Button>
                    </div>
                    {locationError ? (
                        <div className="text-[12px] text-destructive">{locationError}</div>
                    ) : null}
                    {locationPrintError ? (
                        <div className="text-[12px] text-destructive">{locationPrintError}</div>
                    ) : null}
                </div>
                <div className="relative min-w-0">
                    <Icon
                        name="search"
                        className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2 text-lg"
                    />
                    <Input
                        className="pl-9"
                        placeholder="Поиск по номенклатуре, серии, машине…"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        aria-label="Поиск в локации у машины"
                    />
                </div>
                <div className={dataTableScrollViewportClassName}>
                    <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "w-10")} />
                                <TableHead className={dataTableStickyHeadCellClassName}>Машина</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Номенклатура</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Вид номенклатуры</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Серия</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Количество</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Ед. изм.</TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "w-12")} aria-label="Действия" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {locationRowsFiltered.map((row) => {
                                const isRowSelectable = row.rowSelectable === true;
                                const canPrintLabel = isRowSelectable && row.series.length > 0;

                                return (
                                <TableRow
                                    key={row.id}
                                    className={
                                        !isRowSelectable
                                            ? "!bg-destructive/15 hover:!bg-destructive/25 dark:!bg-destructive/20"
                                            : undefined
                                    }
                                >
                                    <TableCell className={dataTableBodyCellClassName}>
                                        <input
                                            type="checkbox"
                                            className="border-input size-4 rounded border disabled:cursor-not-allowed disabled:opacity-50"
                                            checked={locationSelectedIds.has(row.id)}
                                            disabled={!isRowSelectable}
                                            onChange={() => toggleLocationRow(row.id)}
                                            aria-label={`Выбрать позицию ${row.series || row.nomenclature}`}
                                        />
                                    </TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{row.machineId}</TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{row.nomenclature}</TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{row.kindLabel}</TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{row.series}</TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{row.quantity}</TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{row.unit}</TableCell>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon-sm"
                                            className="size-7 shrink-0"
                                            disabled={!canPrintLabel || printingLocationSeriesRef === row.series}
                                            aria-label={
                                                canPrintLabel
                                                    ? `Печать этикетки: ${row.series}`
                                                    : "Печать этикетки недоступна"
                                            }
                                            onClick={() => {
                                                void printLocationRollLabel(row.series);
                                            }}
                                        >
                                            <Icon name="print" size="sm" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                            {locationRowsFiltered.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        className={cn(dataTableBodyCellClassName, "py-8 text-center text-muted-foreground")}
                                        colSpan={8}
                                    >
                                        {locationLoading
                                            ? "Загрузка…"
                                            : "Нет данных. Нажмите «Обновить» для загрузки локации."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <section className="border-border flex flex-col gap-3 border-t pt-2">
                <div className={cnSectionBlockTitle()}>Причины блокировки</div>
                {blockSubmitMessage ? (
                    <Informer tone="success" variant="filled" size="s" title={blockSubmitMessage} />
                ) : null}
                <div className="grid gap-2">
                    <div className={comboboxFieldLabelClassName}>Блокируемая номенклатура</div>
                    {/* <Label htmlFor="material-order-blocked-nom">Блокируемая номенклатура</Label> */}
                    <Input
                        id="material-order-blocked-nom"
                        readOnly
                        value={blockedNomenclatureLine}
                        className="bg-muted/40"
                    />
                </div>
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
                        disabled={blockReasonsLoading || blockReasons.length === 0}
                        onChange={(e) => selectBlockReason(e.target.value || null)}
                    >
                        <option value="">
                            {blockReasonsLoading ? "Загрузка…" : "Не выбрано"}
                        </option>
                        {blockReasons.map((row) => (
                            <option key={row.reasonCode} value={row.reasonCode}>
                                {row.reasonLabel}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="material-order-block-comment">Комментарий для склада</Label>
                    <textarea
                        id="material-order-block-comment"
                        rows={3}
                        value={blockComment}
                        onChange={(e) => setBlockComment(e.target.value)}
                        className={cn(
                            "border-input bg-background placeholder:text-muted-foreground min-h-[72px] w-full resize-y rounded-sm border px-3 py-2 text-sm shadow-xs outline-none",
                            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        )}
                    />
                </div>
                <div className="flex flex-col items-end gap-2">
                    {blockSubmitError ? (
                        <div className="w-full text-[12px] text-destructive">{blockSubmitError}</div>
                    ) : null}
                    <Button
                        type="button"
                        size="sm"
                        disabled={!canSubmitBlock || isSubmittingBlock}
                        onClick={() => {
                            void submitBlock();
                        }}
                    >
                        {isSubmittingBlock ? "Передача…" : "Передать блокировку"}
                    </Button>
                </div>
            </section>
        </div>
    );
}
