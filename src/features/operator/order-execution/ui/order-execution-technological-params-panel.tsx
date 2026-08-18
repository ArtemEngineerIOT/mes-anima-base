import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/shared/ui/kit/button";
import { FloatingAutoDismissInformer } from "@/shared/ui/kit/floating-auto-dismiss-informer";
import { Icon } from "@/shared/ui/kit/icon";
import { Informer } from "@/shared/ui/kit/informer";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { Switch } from "@/shared/ui/kit/switch";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import {
    dataTableBodyCellClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cn } from "@/shared/lib/css";

import { useOrderExecutionMachineStompState } from "../model/machine-stomp/order-execution-machine-stomp-context";
import {
    resolveTechnologicalParamStompValue,
    type TechnologicalParamTagKey,
} from "../model/resolve-technological-param-stomp-value";
import { resolveTechnologicalParamsStompSyncInformer } from "../model/resolve-technological-params-stomp-sync-informer";
import {
    joinTechnologicalParamManualParts,
    resolveTechnologicalParamPartsCount,
    sanitizeTechnologicalParamNumericInput,
    splitTechnologicalParamManualParts,
} from "../model/technological-params-manual-value";
import { isTechnologicalParamOutOfDeviation } from "../model/technological-params-deviation";
import {
    buildTechnologicalParamsDraft,
    buildSavedPresserState,
    createDefaultManualInputMeta,
    createEmptyManualDraft,
    type ManualInputMeta,
    type SavedPresserState,
    type TechnologicalParamsDraft,
} from "../model/technological-params-draft";
import {
    appendHistoryEntry,
    clampSliceWindowOffset,
    createManualHistoryEntry,
    formatHistoryValue,
    formatManualCheckedAtFromDateTimeLocal,
    formatManualCheckedAtToDateTimeLocal,
    lastSliceWindowOffset,
    PROCESS_PARAMS_SLICE_WINDOW_SIZE,
    resolveMaxLaterHistoryCount,
    takeSliceWindowEntries,
    type TechnologicalParamHistoryEntry,
} from "../model/technological-params-history";
import {
    buildInitialTechnologicalParamHistory,
    collectTechnologicalParamRowIds,
    getTechnologicalParamsMock,
    type TechnologicalPrintingSectionRow,
    type TechnologicalProcessParamRow,
    type TechnologicalSpeedRow,
} from "../model/technological-params-mock";
import { useLastProcessParamsSlices } from "../model/technological-params/last-process-params-slices/use-last-process-params-slices";
import { useSaveManualProcessParams } from "../model/technological-params/use-save-manual-process-params";
import type { MachineId } from "../model/types";

type OrderExecutionTechnologicalParamsPanelProps = {
    machineId: MachineId;
    workAreaId?: string;
    layout?: "page" | "embedded";
    showTitle?: boolean;
    title?: string;
    onCancel?: () => void;
};

/** Уставка — выравнивание и tabular-nums без цветовой индикации. */
const standardCellClassName = "text-center tabular-nums";
/** Текущее значение — выравнивание и tabular-nums без цветовой индикации. */
const currentValueCellClassName = "text-center tabular-nums font-medium";
/** Колонка «Текущее значение» / ручной ввод — фиксированная ширина. */
const currentValueColumnClassName = "w-[450px] min-w-[450px] max-w-[450px]";
/** Старт / Срез N — фиксированная ширина, чтобы окно срезов не дёргало таблицу. */
const sliceColumnClassName = "w-40 min-w-40 max-w-40 overflow-hidden";
/** Уставка / отклонение. */
const measureColumnClassName = "w-28 min-w-28 max-w-28";
const manualInputClassName = "h-8 w-full text-center text-[12px] tabular-nums";
const manualPartInputClassName = cn(manualInputClassName, "min-w-0 flex-1 px-1");
const historyValueCellClassName = "text-center tabular-nums";
const bodyCellClassName = cn(dataTableBodyCellClassName, "text-center");

function ManualCompositeValueInput({
    partsCount,
    value,
    onChange,
    ariaLabel,
    className,
}: {
    partsCount: number;
    value: string;
    onChange: (value: string) => void;
    ariaLabel: string;
    className?: string;
}) {
    if (partsCount <= 1) {
        return (
            <Input
                className={cn(manualInputClassName, className)}
                value={value}
                onChange={(event) => onChange(sanitizeTechnologicalParamNumericInput(event.target.value))}
                inputMode="decimal"
                aria-label={ariaLabel}
            />
        );
    }

    const parts = splitTechnologicalParamManualParts(value, partsCount);

    return (
        <div className="flex w-full items-center justify-center gap-1" role="group" aria-label={ariaLabel}>
            {parts.map((part, index) => (
                <div key={`manual-part-${index}`} className="flex min-w-0 flex-1 items-center gap-1">
                    {index > 0 ? (
                        <span className="shrink-0 text-muted-foreground" aria-hidden>
                            -
                        </span>
                    ) : null}
                    <Input
                        className={cn(manualPartInputClassName, className)}
                        value={part}
                        onChange={(event) => {
                            const nextParts = [...parts];
                            nextParts[index] = sanitizeTechnologicalParamNumericInput(event.target.value);
                            onChange(joinTechnologicalParamManualParts(nextParts));
                        }}
                        inputMode="decimal"
                        aria-label={`${ariaLabel}, значение ${index + 1} из ${partsCount}`}
                        placeholder="…"
                    />
                </div>
            ))}
        </div>
    );
}

function TechnologicalParamsSectionTitle({ iconName, title }: { iconName: string; title: string }) {
    return (
        <h3 className={cn(cnSectionBlockTitle(), "flex items-center gap-2")}>
            <Icon name={iconName} size={28} className="shrink-0 font-light leading-none text-foreground" />
            <span>{title}</span>
        </h3>
    );
}

function SliceWindowControls({
    laterCount,
    offset,
    onOffsetChange,
}: {
    laterCount: number;
    offset: number;
    onOffsetChange: (offset: number) => void;
}) {
    const maxOffset = Math.max(0, laterCount - PROCESS_PARAMS_SLICE_WINDOW_SIZE);
    if (laterCount <= PROCESS_PARAMS_SLICE_WINDOW_SIZE) {
        return null;
    }

    const from = offset + 1;
    const to = Math.min(offset + PROCESS_PARAMS_SLICE_WINDOW_SIZE, laterCount);

    return (
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">
                Срезы {from}–{to} из {laterCount}
            </span>
            <div className="flex items-center gap-0.5">
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="size-7"
                    disabled={offset <= 0}
                    onClick={() => onOffsetChange(offset - 1)}
                    aria-label="Предыдущие срезы"
                >
                    <Icon name="chevron_left" className="text-sm" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="size-7"
                    disabled={offset >= maxOffset}
                    onClick={() => onOffsetChange(offset + 1)}
                    aria-label="Следующие срезы"
                >
                    <Icon name="chevron_right" className="text-sm" />
                </Button>
            </div>
        </div>
    );
}

type MeasurableRow = {
    id: string;
    standard: string;
    deviationPm: string;
    start: string;
    stompFieldKey?: TechnologicalParamTagKey;
    stompStandardFieldKey?: TechnologicalParamTagKey;
    fallbackCurrent: string;
    alert?: boolean;
    manualOnly?: boolean;
};

type HistoryColumnMeta = {
    rollNumber: string;
    checkedAt: string;
};

function getStartHistoryEntry(history: TechnologicalParamHistoryEntry[]) {
    return history[0] ?? null;
}

function getLaterHistoryEntries(history: TechnologicalParamHistoryEntry[]) {
    return history.slice(1);
}

function buildStartColumnMeta(
    row: MeasurableRow,
    history: TechnologicalParamHistoryEntry[],
): HistoryColumnMeta {
    const firstEntry = getStartHistoryEntry(history);

    return {
        rollNumber: firstEntry?.rollNumber ?? "—",
        checkedAt: firstEntry?.checkedAt ?? row.start,
    };
}

function HistoryColumnHeader({ meta }: { meta: HistoryColumnMeta | null }) {
    const checkedAt = meta?.checkedAt.trim();
    if (!checkedAt || checkedAt === "—") {
        return <span className="text-muted-foreground">—</span>;
    }

    return (
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-[10px] leading-4 font-normal text-muted-foreground">
            {checkedAt}
        </div>
    );
}

function resolveDeviationToneClassName(
    value: string,
    standardValue: string,
    deviationPm: string,
): string | undefined {
    return isTechnologicalParamOutOfDeviation({
        currentValue: value,
        standardValue,
        deviationPm,
    })
        ? "text-destructive"
        : undefined;
}

function HistoryValueCells({
    entries,
    standardValue,
    deviationPm,
}: {
    entries: Array<TechnologicalParamHistoryEntry | null>;
    standardValue: string;
    deviationPm: string;
}) {
    return (
        <>
            {entries.map((entry, index) => {
                const value = formatHistoryValue(entry);

                return (
                    <TableCell
                        key={`${entry?.checkedAt ?? "empty"}-${index}`}
                        className={cn(
                            bodyCellClassName,
                            historyValueCellClassName,
                            sliceColumnClassName,
                            resolveDeviationToneClassName(value, standardValue, deviationPm),
                        )}
                    >
                        {value}
                    </TableCell>
                );
            })}
        </>
    );
}

function DynamicHeaderGroupCells({
    sliceWindowOffset = 0,
}: {
    sliceWindowOffset?: number;
}) {
    return (
        <>
            <TableHead className={cn(dataTableStickyHeadCellClassName, sliceColumnClassName, "text-center")}>
                Старт
            </TableHead>
            {Array.from({ length: PROCESS_PARAMS_SLICE_WINDOW_SIZE }, (_, index) => (
                <TableHead
                    key={`slice-window-title-${index}`}
                    className={cn(dataTableStickyHeadCellClassName, sliceColumnClassName, "text-center")}
                >
                    Срез {sliceWindowOffset + index + 1}
                </TableHead>
            ))}
            <TableHead
                className={cn(dataTableStickyHeadCellClassName, currentValueColumnClassName, "text-center")}
            >
                Текущее значение
            </TableHead>
        </>
    );
}

function DynamicHeaderMetaCells({
    startMeta,
    historyMetas,
}: {
    startMeta: HistoryColumnMeta | null;
    historyMetas: Array<HistoryColumnMeta | null>;
}) {
    return (
        <>
            <TableHead
                className={cn(
                    dataTableStickyHeadCellClassName,
                    sliceColumnClassName,
                    "text-center align-top",
                )}
            >
                <HistoryColumnHeader meta={startMeta} />
            </TableHead>
            {historyMetas.map((meta, index) => (
                <TableHead
                    key={`auto-history-meta-${index}`}
                    className={cn(
                        dataTableStickyHeadCellClassName,
                        sliceColumnClassName,
                        "text-center align-top",
                    )}
                >
                    <HistoryColumnHeader meta={meta} />
                </TableHead>
            ))}
            <TableHead className={cn(dataTableStickyHeadCellClassName, currentValueColumnClassName)} />
        </>
    );
}

function pickHistorySourceRow(
    rows: MeasurableRow[],
    historyByRowId: Record<string, TechnologicalParamHistoryEntry[]>,
): MeasurableRow | undefined {
    return rows.find((row) => (historyByRowId[row.id] ?? []).length > 0) ?? rows[0];
}

function buildTableHistoryHeaderMeta(
    rows: MeasurableRow[],
    historyByRowId: Record<string, TechnologicalParamHistoryEntry[]>,
    sliceWindowOffset = 0,
): {
    startMeta: HistoryColumnMeta | null;
    historyMetas: Array<HistoryColumnMeta | null>;
} {
    const sourceRow = pickHistorySourceRow(rows, historyByRowId);
    const sourceHistory = sourceRow ? (historyByRowId[sourceRow.id] ?? []) : [];
    const historySlots = takeSliceWindowEntries(getLaterHistoryEntries(sourceHistory), sliceWindowOffset);

    return {
        startMeta: sourceRow ? buildStartColumnMeta(sourceRow, sourceHistory) : null,
        historyMetas: historySlots.map((entry) =>
            entry ? { rollNumber: entry.rollNumber, checkedAt: entry.checkedAt } : null,
        ),
    };
}

function DynamicValueCells({
    row,
    manualEntry,
    history,
    manualValue,
    onManualValueChange,
    currentValue,
    standardValue,
    partsCount = 1,
    sliceWindowOffset = 0,
}: {
    row: MeasurableRow;
    manualEntry: boolean;
    history: TechnologicalParamHistoryEntry[];
    manualValue: string;
    onManualValueChange: (value: string) => void;
    currentValue: string;
    standardValue: string;
    partsCount?: number;
    sliceWindowOffset?: number;
}) {
    const canManualInput =
        Boolean(row.manualOnly) || (standardValue.trim() !== "" && standardValue !== "—");

    const displayedCurrentValue = manualEntry ? manualValue : currentValue;
    const currentValueToneClassName = resolveDeviationToneClassName(
        displayedCurrentValue,
        standardValue,
        row.deviationPm,
    );

    const historyCells = takeSliceWindowEntries(getLaterHistoryEntries(history), sliceWindowOffset);
    const startValue = getStartHistoryEntry(history)?.value ?? "—";

    return (
        <>
            <TableCell
                className={cn(
                    bodyCellClassName,
                    historyValueCellClassName,
                    sliceColumnClassName,
                    resolveDeviationToneClassName(startValue, standardValue, row.deviationPm),
                )}
            >
                {startValue}
            </TableCell>
            <HistoryValueCells
                entries={historyCells}
                standardValue={standardValue}
                deviationPm={row.deviationPm}
            />
            <TableCell
                className={cn(
                    bodyCellClassName,
                    currentValueCellClassName,
                    currentValueColumnClassName,
                    currentValueToneClassName,
                )}
            >
                {manualEntry ? (
                    canManualInput ? (
                        <ManualCompositeValueInput
                            partsCount={partsCount}
                            value={manualValue}
                            onChange={onManualValueChange}
                            ariaLabel={`Текущее значение: ${row.id}`}
                            className={currentValueToneClassName}
                        />
                    ) : (
                        "—"
                    )
                ) : (
                    currentValue
                )}
            </TableCell>
        </>
    );
}

function PrintingSectionsTable({
    title,
    iconName,
    rows,
    manualEntry,
    historyByRowId,
    manualValues,
    presserNumbers,
    onManualValueChange,
    onPresserNoChange,
    resolveCurrentValue,
    resolveStandardValue,
    sliceWindowOffset = 0,
}: {
    title: string;
    iconName: string;
    rows: TechnologicalPrintingSectionRow[];
    manualEntry: boolean;
    historyByRowId: Record<string, TechnologicalParamHistoryEntry[]>;
    manualValues: Record<string, string>;
    presserNumbers: Record<string, string>;
    onManualValueChange: (rowId: string, value: string) => void;
    onPresserNoChange: (rowId: string, value: string) => void;
    resolveCurrentValue: (row: MeasurableRow) => string;
    resolveStandardValue: (row: MeasurableRow) => string;
    sliceWindowOffset?: number;
}) {
    const { startMeta, historyMetas } = buildTableHistoryHeaderMeta(
        rows,
        historyByRowId,
        sliceWindowOffset,
    );

    return (
        <section className="flex flex-col gap-2">
            <TechnologicalParamsSectionTitle iconName={iconName} title={title} />
            <Table className={cn(dataTableShellClassName, "table-fixed text-[12px]")}>
                <TableHeader className="bg-muted/40">
                    <TableRow>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-24 min-w-24 max-w-24 text-center")}>Печатная секция</TableHead>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-24 min-w-24 max-w-24 text-center")}>Цвет</TableHead>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-24 min-w-24 max-w-24 text-center")}>№ прессёра</TableHead>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-56 min-w-56 max-w-56 text-center")} colSpan={2}>
                            Температура, °C
                        </TableHead>
                        <DynamicHeaderGroupCells
                            sliceWindowOffset={sliceWindowOffset}
                        />
                    </TableRow>
                    <TableRow>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-24 min-w-24 max-w-24")} />
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-24 min-w-24 max-w-24")} />
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-24 min-w-24 max-w-24")} />
                        <TableHead className={cn(dataTableStickyHeadCellClassName, measureColumnClassName, "text-center")}>Уставка</TableHead>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, measureColumnClassName, "text-center whitespace-nowrap")}>Отклонение ±</TableHead>
                        <DynamicHeaderMetaCells
                            startMeta={startMeta}
                            historyMetas={historyMetas}
                        />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => {
                        if (row.isEmpty) {
                            return (
                                <TableRow key={row.id}>
                                    <TableCell className={cn(bodyCellClassName, "tabular-nums")}>
                                        {row.sectionNumber}
                                    </TableCell>
                                    <TableCell className={cn(bodyCellClassName, "text-muted-foreground")}>—</TableCell>
                                    <TableCell className={bodyCellClassName}>—</TableCell>
                                    <TableCell className={cn(bodyCellClassName, standardCellClassName)}>—</TableCell>
                                    <TableCell className={cn(bodyCellClassName, "tabular-nums")}>—</TableCell>
                                    <TableCell className={cn(bodyCellClassName, historyValueCellClassName, sliceColumnClassName)}>—</TableCell>
                                    <TableCell className={cn(bodyCellClassName, historyValueCellClassName, sliceColumnClassName)}>—</TableCell>
                                    <TableCell className={cn(bodyCellClassName, historyValueCellClassName, sliceColumnClassName)}>—</TableCell>
                                    <TableCell
                                        className={cn(
                                            bodyCellClassName,
                                            currentValueCellClassName,
                                            currentValueColumnClassName,
                                        )}
                                    >
                                        —
                                    </TableCell>
                                </TableRow>
                            );
                        }

                        const currentValue = resolveCurrentValue(row);
                        const standardValue = resolveStandardValue(row);
                        const partsCount = resolveTechnologicalParamPartsCount({
                            stompFieldKey: row.stompFieldKey,
                            stompStandardFieldKey: row.stompStandardFieldKey,
                            standardValue,
                            currentValue,
                        });

                        return (
                        <TableRow
                            key={row.id}
                            className={
                                row.alert && !manualEntry
                                    ? "!bg-destructive/15 hover:!bg-destructive/25 dark:!bg-destructive/20"
                                    : undefined
                            }
                        >
                            <TableCell className={cn(bodyCellClassName, "tabular-nums")}>
                                {row.sectionNumber}
                            </TableCell>
                            <TableCell className={cn(bodyCellClassName, "text-muted-foreground")}>
                                {row.color || "—"}
                            </TableCell>
                            <TableCell className={bodyCellClassName}>
                                {manualEntry ? (
                                    <Input
                                        className={manualInputClassName}
                                        value={presserNumbers[row.id] ?? row.presserNo}
                                        onChange={(event) => onPresserNoChange(row.id, event.target.value)}
                                        inputMode="numeric"
                                        aria-label={`№ прессёра, секция ${row.sectionNumber}`}
                                    />
                                ) : (
                                    <span className="tabular-nums">{row.presserNo || "—"}</span>
                                )}
                            </TableCell>
                            <TableCell className={cn(bodyCellClassName, standardCellClassName)}>
                                {standardValue || "—"}
                            </TableCell>
                            <TableCell className={cn(bodyCellClassName, "tabular-nums")}>
                                {row.deviationPm}
                            </TableCell>
                            <DynamicValueCells
                                row={row}
                                manualEntry={manualEntry}
                                history={historyByRowId[row.id] ?? []}
                                manualValue={manualValues[row.id] ?? ""}
                                onManualValueChange={(value) => onManualValueChange(row.id, value)}
                                currentValue={currentValue}
                                standardValue={standardValue}
                                partsCount={partsCount}
                                sliceWindowOffset={sliceWindowOffset}
                            />
                        </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </section>
    );
}

function ProcessParamsTable({
    title,
    iconName,
    rows,
    manualEntry,
    historyByRowId,
    manualValues,
    onManualValueChange,
    resolveCurrentValue,
    resolveStandardValue,
    sliceWindowOffset = 0,
}: {
    title: string;
    iconName: string;
    rows: TechnologicalProcessParamRow[];
    manualEntry: boolean;
    historyByRowId: Record<string, TechnologicalParamHistoryEntry[]>;
    manualValues: Record<string, string>;
    onManualValueChange: (rowId: string, value: string) => void;
    resolveCurrentValue: (row: MeasurableRow) => string;
    resolveStandardValue: (row: MeasurableRow) => string;
    sliceWindowOffset?: number;
}) {
    const { startMeta, historyMetas } = buildTableHistoryHeaderMeta(
        rows,
        historyByRowId,
        sliceWindowOffset,
    );

    return (
        <section className="flex flex-col gap-2">
            <TechnologicalParamsSectionTitle iconName={iconName} title={title} />
            <Table className={cn(dataTableShellClassName, "table-fixed text-[12px]")}>
                <TableHeader className="bg-muted/40">
                    <TableRow>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[12rem]")} />
                        <TableHead className={cn(dataTableStickyHeadCellClassName, measureColumnClassName, "text-center")}>Уставка</TableHead>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, measureColumnClassName, "text-center whitespace-nowrap")}>Отклонение ±</TableHead>
                        <DynamicHeaderGroupCells
                            sliceWindowOffset={sliceWindowOffset}
                        />
                    </TableRow>
                    <TableRow>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[12rem]")} />
                        <TableHead className={cn(dataTableStickyHeadCellClassName, measureColumnClassName)} />
                        <TableHead className={cn(dataTableStickyHeadCellClassName, measureColumnClassName)} />
                        <DynamicHeaderMetaCells
                            startMeta={startMeta}
                            historyMetas={historyMetas}
                        />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row.id}
                            className={
                                row.alert && !manualEntry
                                    ? "!bg-destructive/15 hover:!bg-destructive/25 dark:!bg-destructive/20"
                                    : undefined
                            }
                        >
                            <TableCell className={cn(bodyCellClassName, "text-muted-foreground")}>
                                {row.label}
                            </TableCell>
                            <TableCell className={cn(bodyCellClassName, standardCellClassName)}>
                                {resolveStandardValue(row)}
                            </TableCell>
                            <TableCell className={cn(bodyCellClassName, "tabular-nums")}>
                                {row.deviationPm}
                            </TableCell>
                            <DynamicValueCells
                                row={row}
                                manualEntry={manualEntry}
                                history={historyByRowId[row.id] ?? []}
                                manualValue={manualValues[row.id] ?? ""}
                                onManualValueChange={(value) => onManualValueChange(row.id, value)}
                                currentValue={resolveCurrentValue(row)}
                                standardValue={resolveStandardValue(row)}
                                sliceWindowOffset={sliceWindowOffset}
                            />
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </section>
    );
}

function SpeedTable({
    title,
    iconName,
    row,
    manualEntry,
    history,
    manualValue,
    onManualValueChange,
    resolveCurrentValue,
    resolveStandardValue,
    sliceWindowOffset = 0,
}: {
    title: string;
    iconName: string;
    row: TechnologicalSpeedRow;
    manualEntry: boolean;
    history: TechnologicalParamHistoryEntry[];
    manualValue: string;
    onManualValueChange: (value: string) => void;
    resolveCurrentValue: (row: MeasurableRow) => string;
    resolveStandardValue: (row: MeasurableRow) => string;
    sliceWindowOffset?: number;
}) {
    const { startMeta, historyMetas } = buildTableHistoryHeaderMeta(
        [row],
        { [row.id]: history },
        sliceWindowOffset,
    );

    return (
        <section className="flex flex-col gap-2">
            <TechnologicalParamsSectionTitle iconName={iconName} title={title} />
            <Table className={cn(dataTableShellClassName, "table-fixed text-[12px]")}>
                <TableHeader className="bg-muted/40">
                    <TableRow>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[12rem]")} />
                        <TableHead className={cn(dataTableStickyHeadCellClassName, measureColumnClassName, "text-center")}>Уставка</TableHead>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, measureColumnClassName, "text-center whitespace-nowrap")}>Отклонение ±</TableHead>
                        <DynamicHeaderGroupCells
                            sliceWindowOffset={sliceWindowOffset}
                        />
                    </TableRow>
                    <TableRow>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[12rem]")} />
                        <TableHead className={cn(dataTableStickyHeadCellClassName, measureColumnClassName)} />
                        <TableHead className={cn(dataTableStickyHeadCellClassName, measureColumnClassName)} />
                        <DynamicHeaderMetaCells
                            startMeta={startMeta}
                            historyMetas={historyMetas}
                        />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className={row.alert && !manualEntry ? "!bg-destructive/15" : undefined}>
                        <TableCell className={cn(bodyCellClassName, "text-muted-foreground")}>
                            {row.label}
                        </TableCell>
                        <TableCell className={cn(bodyCellClassName, standardCellClassName)}>
                            {resolveStandardValue(row)}
                        </TableCell>
                        <TableCell className={cn(bodyCellClassName, "tabular-nums")}>
                            {row.deviationPm}
                        </TableCell>
                        <DynamicValueCells
                            row={row}
                            manualEntry={manualEntry}
                            history={history}
                            manualValue={manualValue}
                            onManualValueChange={onManualValueChange}
                            currentValue={resolveCurrentValue(row)}
                            standardValue={resolveStandardValue(row)}
                            sliceWindowOffset={sliceWindowOffset}
                        />
                    </TableRow>
                </TableBody>
            </Table>
        </section>
    );
}

export function OrderExecutionTechnologicalParamsPanel({
    machineId,
    workAreaId,
    layout = "page",
    showTitle = true,
    title,
    onCancel,
}: OrderExecutionTechnologicalParamsPanelProps) {
    const baseMock = useMemo(() => getTechnologicalParamsMock(machineId), [machineId]);
    const hasWorkAreaId = Boolean(workAreaId?.trim());

    const {
        sections: loadedSections,
        historyByRowId: slicesHistoryByRowId,
        isLoading: isSlicesLoading,
        error: slicesError,
        errorKey: slicesErrorKey,
        dismissError: dismissSlicesError,
        reload: reloadSlices,
    } = useLastProcessParamsSlices({
        machineId,
        workAreaId,
        enabled: hasWorkAreaId,
    });

    const data = loadedSections ?? baseMock;
    const rowIds = useMemo(() => collectTechnologicalParamRowIds(data), [data]);
    const stompState = useOrderExecutionMachineStompState();
    const stompSyncInformer = useMemo(
        () => resolveTechnologicalParamsStompSyncInformer(stompState),
        [stompState],
    );

    const {
        save: saveManualProcessParams,
        isSaving,
        saveFeedback,
        dismissSaveFeedback,
    } = useSaveManualProcessParams({ workAreaId });

    const [manualEntry, setManualEntry] = useState(false);
    const [sliceWindowOffset, setSliceWindowOffset] = useState(0);
    const [draft, setDraft] = useState<TechnologicalParamsDraft>(() => buildTechnologicalParamsDraft(data));
    const [savedPresser, setSavedPresser] = useState<SavedPresserState>(() => buildSavedPresserState(data));
    const [historyByRowId, setHistoryByRowId] = useState<Record<string, TechnologicalParamHistoryEntry[]>>(() =>
        buildInitialTechnologicalParamHistory(data),
    );

    const resetState = useCallback(() => {
        dismissSaveFeedback();
        setManualEntry(false);
        setDraft(buildTechnologicalParamsDraft(data));
        setSavedPresser(buildSavedPresserState(data));
        setHistoryByRowId(buildInitialTechnologicalParamHistory(data));
        setSliceWindowOffset(0);
    }, [data, dismissSaveFeedback]);

    useEffect(() => {
        setDraft(buildTechnologicalParamsDraft(data));
        setSavedPresser(buildSavedPresserState(data));
        setHistoryByRowId(buildInitialTechnologicalParamHistory(data));
    }, [data]);

    useEffect(() => {
        if (isSlicesLoading) {
            return;
        }

        if (!hasWorkAreaId) {
            setHistoryByRowId(buildInitialTechnologicalParamHistory(data));
            return;
        }

        const next: Record<string, TechnologicalParamHistoryEntry[]> = {};
        for (const [rowId, entries] of Object.entries(slicesHistoryByRowId)) {
            next[rowId] = entries.map((entry) => ({ ...entry }));
        }

        setHistoryByRowId(next);
    }, [data, hasWorkAreaId, isSlicesLoading, slicesHistoryByRowId]);

    useEffect(() => {
        const laterCount = resolveMaxLaterHistoryCount(slicesHistoryByRowId);
        setSliceWindowOffset(manualEntry ? lastSliceWindowOffset(laterCount) : 0);
    }, [manualEntry, slicesHistoryByRowId]);

    const laterSliceCount = useMemo(() => resolveMaxLaterHistoryCount(historyByRowId), [historyByRowId]);
    const clampedSliceWindowOffset = clampSliceWindowOffset(laterSliceCount, sliceWindowOffset);

    const resolveCurrentValue = useCallback(
        (row: MeasurableRow) =>
            resolveTechnologicalParamStompValue(stompState, row.stompFieldKey, row.fallbackCurrent),
        [stompState],
    );

    const resolveStandardValue = useCallback((row: MeasurableRow) => row.standard || "—", []);

    const currentRollNumber = useMemo(() => {
        if (!stompState.isStompConnected || !stompState.hasReceivedTagsData) {
            return "";
        }

        const reel = stompState.tagsSnapshot.fields.reel_countmeter;
        return reel === undefined || reel === null || reel === "" ? "" : String(reel);
    }, [stompState]);

    const handleManualEntryChange = (checked: boolean) => {
        dismissSaveFeedback();
        setManualEntry(checked);
        setDraft({
            presserNumbers: { ...savedPresser.numbers },
            manualValues: createEmptyManualDraft(rowIds),
            manualInputMeta: createDefaultManualInputMeta(currentRollNumber),
        });
    };

    const handleManualValueChange = (rowId: string, value: string) => {
        setDraft((prev) => ({
            ...prev,
            manualValues: {
                ...prev.manualValues,
                [rowId]: value,
            },
        }));
    };

    const handleManualInputMetaChange = (patch: Partial<ManualInputMeta>) => {
        setDraft((prev) => ({
            ...prev,
            manualInputMeta: {
                ...prev.manualInputMeta,
                ...patch,
            },
        }));
    };

    const handlePresserNoChange = (rowId: string, value: string) => {
        setDraft((prev) => ({
            ...prev,
            presserNumbers: {
                ...prev.presserNumbers,
                [rowId]: value,
            },
        }));
    };

    const handleSave = async () => {
        const ok = await saveManualProcessParams({ sections: data, draft });
        if (!ok) {
            return;
        }

        setSavedPresser({
            numbers: { ...draft.presserNumbers },
        });

        setHistoryByRowId((prev) => {
            const next = { ...prev };

            for (const rowId of rowIds) {
                const value = draft.manualValues[rowId]?.trim() ?? "";
                if (!value) {
                    continue;
                }

                next[rowId] = appendHistoryEntry(
                    prev[rowId] ?? [],
                    createManualHistoryEntry(
                        value,
                        draft.manualInputMeta.rollNumber,
                        draft.manualInputMeta.checkedAt,
                    ),
                );
            }

            return next;
        });

        setDraft((prev) => ({
            ...prev,
            manualValues: createEmptyManualDraft(rowIds),
            manualInputMeta: createDefaultManualInputMeta(currentRollNumber),
        }));

        void reloadSlices();
    };

    const manualEntryId =
        layout === "page" ? "tech-params-manual-entry-page" : "tech-params-manual-entry-embedded";

    return (
        <section className="flex min-h-0 flex-1 flex-col">
            <div className="app-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-auto pb-4">
            {showTitle ? (
                <div className={cnSectionBlockTitle()}>{title ?? `Технологические параметры ${machineId}`}</div>
            ) : null}

            <Informer
                tone={stompSyncInformer.tone}
                variant="filled"
                size="s"
                title={stompSyncInformer.title}
                description={stompSyncInformer.description}
            />

            {slicesError ? (
                <FloatingAutoDismissInformer
                    key={`tech-params-slices-error:${slicesErrorKey}`}
                    title="Ошибка"
                    description={slicesError}
                    tone="alert"
                    variant="bordered"
                    size="s"
                    onDismiss={dismissSlicesError}
                />
            ) : null}

            {saveFeedback ? (
                <FloatingAutoDismissInformer
                    key={saveFeedback.key}
                    title={saveFeedback.title}
                    description={saveFeedback.description}
                    tone={saveFeedback.tone}
                    variant="bordered"
                    size="s"
                    onDismiss={dismissSaveFeedback}
                />
            ) : null}

            <Informer tone="system" variant="bordered" size="s" title="Правила заполнения" description={data.rulesText} />

            {manualEntry ? (
                <div className="flex flex-wrap items-end justify-end gap-4">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="tech-params-roll-number" className="text-sm text-muted-foreground">
                            Наименование рулона
                        </Label>
                        <Input
                            id="tech-params-roll-number"
                            className="h-8 w-40 overflow-hidden text-[12px] tabular-nums placeholder:truncate"
                            value={draft.manualInputMeta.rollNumber}
                            onChange={(event) => handleManualInputMetaChange({ rollNumber: event.target.value })}
                            placeholder="Введите имя"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="tech-params-checked-at" className="text-sm text-muted-foreground">
                            Дата и время
                        </Label>
                        <Input
                            id="tech-params-checked-at"
                            type="datetime-local"
                            step={1}
                            className="h-8 w-[15.5rem] text-[12px] tabular-nums"
                            value={formatManualCheckedAtToDateTimeLocal(draft.manualInputMeta.checkedAt)}
                            onChange={(event) =>
                                handleManualInputMetaChange({
                                    checkedAt: formatManualCheckedAtFromDateTimeLocal(event.target.value),
                                })
                            }
                        />
                    </div>
                </div>
            ) : null}

            <SliceWindowControls
                laterCount={laterSliceCount}
                offset={clampedSliceWindowOffset}
                onOffsetChange={setSliceWindowOffset}
            />

            <PrintingSectionsTable
                title={data.printingTitle}
                iconName="settings"
                rows={data.printingSections}
                manualEntry={manualEntry}
                historyByRowId={historyByRowId}
                manualValues={draft.manualValues}
                presserNumbers={manualEntry ? draft.presserNumbers : savedPresser.numbers}
                onManualValueChange={handleManualValueChange}
                onPresserNoChange={handlePresserNoChange}
                resolveCurrentValue={resolveCurrentValue}
                resolveStandardValue={resolveStandardValue}
                sliceWindowOffset={clampedSliceWindowOffset}
            />
            <ProcessParamsTable
                title={data.unwindingTitle}
                iconName="arrow_circle_right"
                rows={data.unwinding}
                manualEntry={manualEntry}
                historyByRowId={historyByRowId}
                manualValues={draft.manualValues}
                onManualValueChange={handleManualValueChange}
                resolveCurrentValue={resolveCurrentValue}
                resolveStandardValue={resolveStandardValue}
                sliceWindowOffset={clampedSliceWindowOffset}
            />
            <ProcessParamsTable
                title={data.windingTitle}
                iconName="arrow_circle_left"
                rows={data.winding}
                manualEntry={manualEntry}
                historyByRowId={historyByRowId}
                manualValues={draft.manualValues}
                onManualValueChange={handleManualValueChange}
                resolveCurrentValue={resolveCurrentValue}
                resolveStandardValue={resolveStandardValue}
                sliceWindowOffset={clampedSliceWindowOffset}
            />
            <SpeedTable
                title={data.speedTitle}
                iconName="speed"
                row={data.speed}
                manualEntry={manualEntry}
                history={historyByRowId[data.speed.id] ?? []}
                manualValue={draft.manualValues[data.speed.id] ?? ""}
                onManualValueChange={(value) => handleManualValueChange(data.speed.id, value)}
                resolveCurrentValue={resolveCurrentValue}
                resolveStandardValue={resolveStandardValue}
                sliceWindowOffset={clampedSliceWindowOffset}
            />
            </div>

            <footer className="shrink-0 border-t border-border bg-card py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Switch
                        id={manualEntryId}
                        checked={manualEntry}
                        onCheckedChange={handleManualEntryChange}
                    />
                    <Label htmlFor={manualEntryId} className="cursor-pointer text-sm font-normal">
                        Ручной режим
                    </Label>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {manualEntry ? (
                        <Button
                            type="button"
                            onClick={() => {
                                void handleSave();
                            }}
                            pending={isSaving}
                            pendingLabel="Сохранение…"
                        >
                            Сохранить
                        </Button>
                    ) : null}
                    {onCancel ? (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Отмена
                        </Button>
                    ) : null}
                    {manualEntry && layout === "page" ? (
                        <Button type="button" variant="outline" onClick={resetState}>
                            Сбросить
                        </Button>
                    ) : null}
                </div>
            </div>
            </footer>
        </section>
    );
}
