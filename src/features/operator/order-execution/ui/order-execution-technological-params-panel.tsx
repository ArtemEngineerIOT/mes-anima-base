import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/shared/ui/kit/button";
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
    resolveTechnologicalParamStompStandard,
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
    createManualHistoryEntry,
    formatHistoryValue,
    formatManualCheckedAtFromDateTimeLocal,
    formatManualCheckedAtToDateTimeLocal,
    getLastHistoryEntries,
    padHistoryEntries,
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
import type { MachineId } from "../model/types";

type OrderExecutionTechnologicalParamsPanelProps = {
    machineId: MachineId;
    layout?: "page" | "embedded";
    showTitle?: boolean;
    title?: string;
    onCancel?: () => void;
};

/** Уставка — зелёный фон (тон success / emerald из kit Informer). */
const standardCellClassName = "bg-emerald-500/15 text-center tabular-nums";
/** Текущее значение — оранжевый/янтарный фон (тон warning / amber из kit Informer). */
const currentValueCellClassName = "bg-amber-500/15 text-center tabular-nums font-medium";
/** Колонка «Текущее значение» / ручной ввод — фиксированная ширина. */
const currentValueColumnClassName = "w-[450px] min-w-[450px] max-w-[450px]";
const manualInputClassName = "h-8 w-full text-center text-[12px] tabular-nums";
const manualPartInputClassName = cn(manualInputClassName, "min-w-0 flex-1 px-1");
const historyValueCellClassName = "text-center tabular-nums";
const bodyCellClassName = cn(dataTableBodyCellClassName, "text-center");

function ManualCompositeValueInput({
    partsCount,
    value,
    onChange,
    ariaLabel,
}: {
    partsCount: number;
    value: string;
    onChange: (value: string) => void;
    ariaLabel: string;
}) {
    if (partsCount <= 1) {
        return (
            <Input
                className={manualInputClassName}
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
                        className={manualPartInputClassName}
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

type MeasurableRow = {
    id: string;
    standard: string;
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

function buildStartColumnMeta(
    row: MeasurableRow,
    history: TechnologicalParamHistoryEntry[],
): HistoryColumnMeta {
    const firstEntry = history[0];

    return {
        rollNumber: firstEntry?.rollNumber ?? "—",
        checkedAt: firstEntry?.checkedAt ?? row.start,
    };
}

function HistoryColumnHeader({ meta }: { meta: HistoryColumnMeta | null }) {
    if (!meta) {
        return <span className="text-muted-foreground">—</span>;
    }

    return (
        <div className="flex flex-col items-center gap-0.5 text-center text-[10px] leading-4 font-normal text-muted-foreground">
            <span>{meta.rollNumber}</span>
            <span>{meta.checkedAt}</span>
        </div>
    );
}

function HistoryValueCells({
    entries,
}: {
    entries: Array<TechnologicalParamHistoryEntry | null>;
}) {
    return (
        <>
            {entries.map((entry, index) => (
                <TableCell
                    key={`${entry?.checkedAt ?? "empty"}-${index}`}
                    className={cn(bodyCellClassName, historyValueCellClassName)}
                >
                    {formatHistoryValue(entry)}
                </TableCell>
            ))}
        </>
    );
}

function DynamicHeaderGroupCells({ manualEntry }: { manualEntry: boolean }) {
    if (manualEntry) {
        return (
            <>
                <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-28 text-center")} colSpan={3} />
                <TableHead
                    className={cn(
                        dataTableStickyHeadCellClassName,
                        currentValueColumnClassName,
                        "text-center",
                    )}
                >
                    Текущее значение
                </TableHead>
            </>
        );
    }

    return (
        <>
            <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-28 text-center")}>Старт</TableHead>
            <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-28 text-center")}>Срез 1</TableHead>
            <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-28 text-center")}>Срез 2</TableHead>
            <TableHead
                className={cn(dataTableStickyHeadCellClassName, currentValueColumnClassName, "text-center")}
            >
                Текущее значение
            </TableHead>
        </>
    );
}

const manualMetaInputClassName = "h-7 text-center text-[10px] tabular-nums";

function ManualInputColumnHeader({
    meta,
    onMetaChange,
}: {
    meta: ManualInputMeta;
    onMetaChange: (patch: Partial<ManualInputMeta>) => void;
}) {
    return (
        <div className="flex flex-col gap-1">
            <Input
                className={manualMetaInputClassName}
                value={meta.rollNumber}
                onChange={(event) => onMetaChange({ rollNumber: event.target.value })}
                placeholder="№ рулона"
                aria-label="Номер рулона"
            />
            <Input
                type="datetime-local"
                step={1}
                className={manualMetaInputClassName}
                value={formatManualCheckedAtToDateTimeLocal(meta.checkedAt)}
                onChange={(event) =>
                    onMetaChange({ checkedAt: formatManualCheckedAtFromDateTimeLocal(event.target.value) })
                }
                aria-label="Время проверки"
            />
        </div>
    );
}

function DynamicHeaderMetaCells({
    manualEntry,
    startMeta,
    historyMetas,
    manualInputMeta,
    onManualInputMetaChange,
}: {
    manualEntry: boolean;
    startMeta: HistoryColumnMeta | null;
    historyMetas: Array<HistoryColumnMeta | null>;
    manualInputMeta?: ManualInputMeta;
    onManualInputMetaChange?: (patch: Partial<ManualInputMeta>) => void;
}) {
    if (manualEntry) {
        return (
            <>
                {historyMetas.map((meta, index) => (
                    <TableHead
                        key={`manual-history-meta-${index}`}
                        className={cn(dataTableStickyHeadCellClassName, "min-w-28 text-center align-top")}
                    >
                        <HistoryColumnHeader meta={meta} />
                    </TableHead>
                ))}
                <TableHead
                    className={cn(
                        dataTableStickyHeadCellClassName,
                        currentValueColumnClassName,
                        "text-center align-top",
                    )}
                >
                    {manualInputMeta && onManualInputMetaChange ? (
                        <ManualInputColumnHeader meta={manualInputMeta} onMetaChange={onManualInputMetaChange} />
                    ) : null}
                </TableHead>
            </>
        );
    }

    return (
        <>
            <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-28 text-center align-top")}>
                <HistoryColumnHeader meta={startMeta} />
            </TableHead>
            {historyMetas.map((meta, index) => (
                <TableHead
                    key={`auto-history-meta-${index}`}
                    className={cn(dataTableStickyHeadCellClassName, "min-w-28 text-center align-top")}
                >
                    <HistoryColumnHeader meta={meta} />
                </TableHead>
            ))}
            <TableHead className={cn(dataTableStickyHeadCellClassName, currentValueColumnClassName)} />
        </>
    );
}

function buildTableHistoryHeaderMeta(
    rows: MeasurableRow[],
    historyByRowId: Record<string, TechnologicalParamHistoryEntry[]>,
    manualEntry: boolean,
): {
    startMeta: HistoryColumnMeta | null;
    historyMetas: Array<HistoryColumnMeta | null>;
} {
    const firstRow = rows[0];
    const firstHistory = firstRow ? (historyByRowId[firstRow.id] ?? []) : [];

    if (manualEntry) {
        const slots = padHistoryEntries(getLastHistoryEntries(firstHistory, 3), 3);
        return {
            startMeta: null,
            historyMetas: slots.map((entry) =>
                entry ? { rollNumber: entry.rollNumber, checkedAt: entry.checkedAt } : null,
            ),
        };
    }

    const historySlots = padHistoryEntries(getLastHistoryEntries(firstHistory, 2), 2);

    return {
        startMeta: firstRow ? buildStartColumnMeta(firstRow, firstHistory) : null,
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
}: {
    row: MeasurableRow;
    manualEntry: boolean;
    history: TechnologicalParamHistoryEntry[];
    manualValue: string;
    onManualValueChange: (value: string) => void;
    currentValue: string;
    standardValue: string;
    partsCount?: number;
}) {
    const canManualInput =
        Boolean(row.manualOnly) || (standardValue.trim() !== "" && standardValue !== "—");

    if (manualEntry) {
        const historyCells = padHistoryEntries(history, 3);

        return (
            <>
                <HistoryValueCells entries={historyCells} />
                <TableCell className={cn(bodyCellClassName, currentValueCellClassName, currentValueColumnClassName)}>
                    {canManualInput ? (
                        <ManualCompositeValueInput
                            partsCount={partsCount}
                            value={manualValue}
                            onChange={onManualValueChange}
                            ariaLabel={`Текущее значение: ${row.id}`}
                        />
                    ) : (
                        "—"
                    )}
                </TableCell>
            </>
        );
    }

    const historyCells = padHistoryEntries(getLastHistoryEntries(history, 2), 2);
    const startValue = history[0]?.value ?? "—";

    return (
        <>
            <TableCell className={cn(bodyCellClassName, historyValueCellClassName)}>{startValue}</TableCell>
            <HistoryValueCells entries={historyCells} />
            <TableCell className={cn(bodyCellClassName, currentValueCellClassName, currentValueColumnClassName)}>
                {currentValue}
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
    manualInputMeta,
    onManualInputMetaChange,
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
    manualInputMeta?: ManualInputMeta;
    onManualInputMetaChange?: (patch: Partial<ManualInputMeta>) => void;
}) {
    const { startMeta, historyMetas } = buildTableHistoryHeaderMeta(rows, historyByRowId, manualEntry);

    return (
        <section className="flex flex-col gap-2">
            <TechnologicalParamsSectionTitle iconName={iconName} title={title} />
            <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                <TableHeader className="bg-muted/40">
                    <TableRow>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-24 text-center")}>Печатная секция</TableHead>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-24 text-center")}>Цвет</TableHead>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-24 text-center")}>№ прессёра</TableHead>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-28 text-center")} colSpan={2}>
                            Температура, °C
                        </TableHead>
                        <DynamicHeaderGroupCells manualEntry={manualEntry} />
                    </TableRow>
                    <TableRow>
                        <TableHead className={dataTableStickyHeadCellClassName} />
                        <TableHead className={dataTableStickyHeadCellClassName} />
                        <TableHead className={dataTableStickyHeadCellClassName} />
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "text-center")}>Уставка</TableHead>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "text-center whitespace-nowrap")}>Отклонение ±</TableHead>
                        <DynamicHeaderMetaCells
                            manualEntry={manualEntry}
                            startMeta={startMeta}
                            historyMetas={historyMetas}
                            manualInputMeta={manualInputMeta}
                            onManualInputMetaChange={onManualInputMetaChange}
                        />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => {
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
                                        value={presserNumbers[row.id] ?? ""}
                                        onChange={(event) => onPresserNoChange(row.id, event.target.value)}
                                        inputMode="numeric"
                                        aria-label={`№ прессёра, секция ${row.sectionNumber}`}
                                    />
                                ) : (
                                    <span className="tabular-nums">{presserNumbers[row.id] || "—"}</span>
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
    manualInputMeta,
    onManualInputMetaChange,
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
    manualInputMeta?: ManualInputMeta;
    onManualInputMetaChange?: (patch: Partial<ManualInputMeta>) => void;
}) {
    const { startMeta, historyMetas } = buildTableHistoryHeaderMeta(rows, historyByRowId, manualEntry);

    return (
        <section className="flex flex-col gap-2">
            <TechnologicalParamsSectionTitle iconName={iconName} title={title} />
            <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                <TableHeader className="bg-muted/40">
                    <TableRow>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[12rem]")} />
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-28 text-center")}>Уставка</TableHead>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-28 text-center whitespace-nowrap")}>Отклонение ±</TableHead>
                        <DynamicHeaderGroupCells manualEntry={manualEntry} />
                    </TableRow>
                    <TableRow>
                        <TableHead className={dataTableStickyHeadCellClassName} />
                        <TableHead className={dataTableStickyHeadCellClassName} />
                        <TableHead className={dataTableStickyHeadCellClassName} />
                        <DynamicHeaderMetaCells
                            manualEntry={manualEntry}
                            startMeta={startMeta}
                            historyMetas={historyMetas}
                            manualInputMeta={manualInputMeta}
                            onManualInputMetaChange={onManualInputMetaChange}
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
    manualInputMeta,
    onManualInputMetaChange,
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
    manualInputMeta?: ManualInputMeta;
    onManualInputMetaChange?: (patch: Partial<ManualInputMeta>) => void;
}) {
    const { startMeta, historyMetas } = buildTableHistoryHeaderMeta([row], { [row.id]: history }, manualEntry);

    return (
        <section className="flex flex-col gap-2">
            <TechnologicalParamsSectionTitle iconName={iconName} title={title} />
            <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                <TableHeader className="bg-muted/40">
                    <TableRow>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[12rem]")} />
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-28 text-center")}>Уставка</TableHead>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-28 text-center whitespace-nowrap")}>Отклонение ±</TableHead>
                        <DynamicHeaderGroupCells manualEntry={manualEntry} />
                    </TableRow>
                    <TableRow>
                        <TableHead className={dataTableStickyHeadCellClassName} />
                        <TableHead className={dataTableStickyHeadCellClassName} />
                        <TableHead className={dataTableStickyHeadCellClassName} />
                        <DynamicHeaderMetaCells
                            manualEntry={manualEntry}
                            startMeta={startMeta}
                            historyMetas={historyMetas}
                            manualInputMeta={manualInputMeta}
                            onManualInputMetaChange={onManualInputMetaChange}
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
                        />
                    </TableRow>
                </TableBody>
            </Table>
        </section>
    );
}

export function OrderExecutionTechnologicalParamsPanel({
    machineId,
    layout = "page",
    showTitle = true,
    title,
    onCancel,
}: OrderExecutionTechnologicalParamsPanelProps) {
    const data = getTechnologicalParamsMock(machineId);
    const rowIds = useMemo(() => collectTechnologicalParamRowIds(data), [data]);
    const stompState = useOrderExecutionMachineStompState();
    const stompSyncInformer = useMemo(
        () => resolveTechnologicalParamsStompSyncInformer(stompState),
        [stompState],
    );

    const [manualEntry, setManualEntry] = useState(false);
    const [draft, setDraft] = useState<TechnologicalParamsDraft>(() => buildTechnologicalParamsDraft(data));
    const [savedPresser, setSavedPresser] = useState<SavedPresserState>(() => buildSavedPresserState(data));
    const [historyByRowId, setHistoryByRowId] = useState<Record<string, TechnologicalParamHistoryEntry[]>>(() =>
        buildInitialTechnologicalParamHistory(data),
    );

    const resetState = useCallback(() => {
        setManualEntry(false);
        setDraft(buildTechnologicalParamsDraft(data));
        setSavedPresser(buildSavedPresserState(data));
        setHistoryByRowId(buildInitialTechnologicalParamHistory(data));
    }, [data]);

    useEffect(() => {
        setDraft(buildTechnologicalParamsDraft(data));
        setSavedPresser(buildSavedPresserState(data));
        setHistoryByRowId(buildInitialTechnologicalParamHistory(data));
    }, [data]);

    const resolveCurrentValue = useCallback(
        (row: MeasurableRow) =>
            resolveTechnologicalParamStompValue(stompState, row.stompFieldKey, row.fallbackCurrent),
        [stompState],
    );

    const resolveStandardValue = useCallback(
        (row: MeasurableRow) =>
            resolveTechnologicalParamStompStandard(stompState, row.stompStandardFieldKey, row.standard),
        [stompState],
    );

    const currentRollNumber = useMemo(() => {
        if (!stompState.isStompConnected || !stompState.hasReceivedTagsData) {
            return "";
        }

        const reel = stompState.tagsSnapshot.fields.reel_countmeter;
        return reel === undefined || reel === null || reel === "" ? "" : String(reel);
    }, [stompState]);

    const handleManualEntryChange = (checked: boolean) => {
        setManualEntry(checked);
        setDraft({
            presserWidth: savedPresser.width,
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

    const handleSave = () => {
        setSavedPresser({
            width: draft.presserWidth,
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

            <Informer tone="system" variant="bordered" size="s" title="Правила заполнения" description={data.rulesText} />

            <div className="flex flex-col gap-1 sm:items-end">
                <Label htmlFor="tech-params-presser-width" className="text-sm text-muted-foreground">
                    Ширина прессёров:
                </Label>
                {manualEntry ? (
                    <Input
                        id="tech-params-presser-width"
                        className="h-8 max-w-xs text-right text-[12px]"
                        value={draft.presserWidth}
                        onChange={(event) =>
                            setDraft((prev) => ({
                                ...prev,
                                presserWidth: event.target.value,
                            }))
                        }
                        placeholder="Обязательно вписать ширину прессёра"
                    />
                ) : (
                    <div className="min-h-8 max-w-xs px-1 text-right text-[12px] tabular-nums">
                        {savedPresser.width || "—"}
                    </div>
                )}
            </div>

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
                manualInputMeta={manualEntry ? draft.manualInputMeta : undefined}
                onManualInputMetaChange={manualEntry ? handleManualInputMetaChange : undefined}
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
                manualInputMeta={manualEntry ? draft.manualInputMeta : undefined}
                onManualInputMetaChange={manualEntry ? handleManualInputMetaChange : undefined}
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
                manualInputMeta={manualEntry ? draft.manualInputMeta : undefined}
                onManualInputMetaChange={manualEntry ? handleManualInputMetaChange : undefined}
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
                manualInputMeta={manualEntry ? draft.manualInputMeta : undefined}
                onManualInputMetaChange={manualEntry ? handleManualInputMetaChange : undefined}
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
                        <Button type="button" onClick={handleSave}>
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
