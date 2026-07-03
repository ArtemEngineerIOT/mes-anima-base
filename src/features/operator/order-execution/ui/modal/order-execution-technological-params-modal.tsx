import { useCallback, useEffect, useState } from "react";

import { Button } from "@/shared/ui/kit/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/kit/dialog";
import { Icon } from "@/shared/ui/kit/icon";
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
import {
    buildTechnologicalParamsDraft,
    type TechnologicalParamSectionKey,
    type TechnologicalParamsDraft,
} from "../../model/technological-params-draft";
import {
    getTechnologicalParamsMock,
    type TechnologicalParamRow,
    type TechnologicalSpeedRow,
} from "../../model/technological-params-mock";
import type { MachineId } from "../../model/types";

type OrderExecutionTechnologicalParamsModalProps = {
    machineId: MachineId;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const speedHeaders = [
    "Стандарт",
    "Отклонение ±",
    "Старт",
    "Текущее значение",
    "Отклонение",
    "Обновление",
] as const;

const paramHeaders = [
    "",
    "Ед. изм.",
    "Стандарт",
    "Отклонение ±",
    "Старт",
    "Текущее значение",
    "Отклонение",
    "Обновление",
] as const;

const manualInputClassName = "h-8 text-right text-[12px] tabular-nums";

type CurrentValueCellProps = {
    manualEntry: boolean;
    value: string;
    onChange: (value: string) => void;
};

function CurrentValueCell({ manualEntry, value, onChange }: CurrentValueCellProps) {
    return (
        <TableCell className={cn(dataTableBodyCellClassName, "text-right tabular-nums")}>
            {manualEntry ? (
                <Input
                    className={manualInputClassName}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    inputMode="decimal"
                    aria-label="Текущее значение"
                />
            ) : (
                value
            )}
        </TableCell>
    );
}

function SpeedSection({
    title,
    row,
    manualEntry,
    currentValue,
    onCurrentChange,
}: {
    title: string;
    row: TechnologicalSpeedRow;
    manualEntry: boolean;
    currentValue: string;
    onCurrentChange: (value: string) => void;
}) {
    return (
        <section className="flex flex-col gap-2">
            <h3 className={cnSectionBlockTitle()}>{title}</h3>
            <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                <TableHeader className="bg-muted/40">
                    <TableRow>
                        {speedHeaders.map((header) => (
                            <TableHead
                                key={header}
                                className={cn(dataTableStickyHeadCellClassName, header ? "text-right" : "")}
                            >
                                {header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className={cn(dataTableBodyCellClassName, "text-right tabular-nums")}>
                            {row.standard}
                        </TableCell>
                        <TableCell className={cn(dataTableBodyCellClassName, "text-right tabular-nums")}>
                            {row.deviationPm}
                        </TableCell>
                        <TableCell className={cn(dataTableBodyCellClassName, "text-right tabular-nums")}>
                            {row.start}
                        </TableCell>
                        <CurrentValueCell
                            manualEntry={manualEntry}
                            value={currentValue}
                            onChange={onCurrentChange}
                        />
                        <TableCell className={cn(dataTableBodyCellClassName, "text-right tabular-nums")}>
                            {row.deviation}
                        </TableCell>
                        <TableCell className={cn(dataTableBodyCellClassName, "text-right tabular-nums")}>
                            {row.updated}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </section>
    );
}

function ParamsSection({
    title,
    rows,
    sectionKey,
    manualEntry,
    draftValues,
    onDraftChange,
}: {
    title: string;
    rows: TechnologicalParamRow[];
    sectionKey: TechnologicalParamSectionKey;
    manualEntry: boolean;
    draftValues: Record<string, string>;
    onDraftChange: (sectionKey: TechnologicalParamSectionKey, label: string, value: string) => void;
}) {
    return (
        <section className="flex flex-col gap-2">
            <h3 className={cnSectionBlockTitle()}>{title}</h3>
            <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                <TableHeader className="bg-muted/40 text-foreground">
                    <TableRow>
                        {paramHeaders.map((header, index) => (
                            <TableHead
                                key={`${header}-${index}`}
                                className={cn(
                                    dataTableStickyHeadCellClassName,
                                    index >= 2 ? "text-right" : index === 0 ? "w-[28%] min-w-[8rem]" : "w-24",
                                )}
                            >
                                {header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row.label}
                            className={
                                row.alert && !manualEntry
                                    ? "!bg-destructive/15 hover:!bg-destructive/25 dark:!bg-destructive/20"
                                    : undefined
                            }
                        >
                            <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>
                                {row.label}
                            </TableCell>
                            <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground tabular-nums")}>
                                {row.unit}
                            </TableCell>
                            <TableCell className={cn(dataTableBodyCellClassName, "text-right tabular-nums")}>
                                {row.standard}
                            </TableCell>
                            <TableCell className={cn(dataTableBodyCellClassName, "text-right tabular-nums")}>
                                {row.deviationPm}
                            </TableCell>
                            <TableCell className={cn(dataTableBodyCellClassName, "text-right tabular-nums")}>
                                {row.start}
                            </TableCell>
                            <CurrentValueCell
                                manualEntry={manualEntry}
                                value={draftValues[row.label] ?? row.current}
                                onChange={(value) => onDraftChange(sectionKey, row.label, value)}
                            />
                            <TableCell className={cn(dataTableBodyCellClassName, "text-right tabular-nums")}>
                                {row.deviation}
                            </TableCell>
                            <TableCell className={cn(dataTableBodyCellClassName, "text-right tabular-nums")}>
                                {row.updated}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </section>
    );
}

export function OrderExecutionTechnologicalParamsModal({
    machineId,
    open,
    onOpenChange,
}: OrderExecutionTechnologicalParamsModalProps) {
    const data = getTechnologicalParamsMock(machineId);
    const [manualEntry, setManualEntry] = useState(false);
    const [draft, setDraft] = useState<TechnologicalParamsDraft>(() => buildTechnologicalParamsDraft(data));

    const resetState = useCallback(() => {
        setManualEntry(false);
        setDraft(buildTechnologicalParamsDraft(data));
    }, [data]);

    useEffect(() => {
        if (!open) {
            resetState();
            return;
        }
        setDraft(buildTechnologicalParamsDraft(data));
    }, [open, data, resetState]);

    const handleManualEntryChange = (checked: boolean) => {
        setManualEntry(checked);
        if (!checked) {
            setDraft(buildTechnologicalParamsDraft(data));
        }
    };

    const handleDraftChange = (sectionKey: TechnologicalParamSectionKey, label: string, value: string) => {
        setDraft((prev) => ({
            ...prev,
            params: {
                ...prev.params,
                [sectionKey]: {
                    ...prev.params[sectionKey],
                    [label]: value,
                },
            },
        }));
    };

    const handleSave = () => {
        // TODO: отправка ручного ввода на BFF
        onOpenChange(false);
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="xl" className="flex max-h-[min(90vh,900px)] flex-col gap-0 overflow-hidden">
                <DialogHeader className="flex-row items-start justify-between gap-4 border-b px-4 py-3 text-left">
                    <DialogTitle>Технологические параметры {machineId}</DialogTitle>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost" size="icon-sm" className="shrink-0" aria-label="Закрыть">
                            <Icon name="close" size="sm" />
                        </Button>
                    </DialogClose>
                </DialogHeader>

                <div className="app-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4 py-4">
                    <SpeedSection
                        title={data.speedTitle}
                        row={data.speed}
                        manualEntry={manualEntry}
                        currentValue={draft.speedCurrent}
                        onCurrentChange={(value) => setDraft((prev) => ({ ...prev, speedCurrent: value }))}
                    />
                    <ParamsSection
                        title={data.unwinding1Title}
                        rows={data.unwinding1}
                        sectionKey="unwinding1"
                        manualEntry={manualEntry}
                        draftValues={draft.params.unwinding1}
                        onDraftChange={handleDraftChange}
                    />
                    <ParamsSection
                        title={data.unwinding2Title}
                        rows={data.unwinding2}
                        sectionKey="unwinding2"
                        manualEntry={manualEntry}
                        draftValues={draft.params.unwinding2}
                        onDraftChange={handleDraftChange}
                    />
                    <ParamsSection
                        title={data.winding1Title}
                        rows={data.winding1}
                        sectionKey="winding1"
                        manualEntry={manualEntry}
                        draftValues={draft.params.winding1}
                        onDraftChange={handleDraftChange}
                    />
                </div>

                <DialogFooter className="flex-row flex-wrap items-center justify-between gap-3 border-t px-4 py-3 sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="tech-params-manual-entry"
                            checked={manualEntry}
                            onCheckedChange={handleManualEntryChange}
                        />
                        <Label htmlFor="tech-params-manual-entry" className="cursor-pointer text-sm font-normal">
                            Ручной ввод
                        </Label>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {manualEntry ? (
                            <Button type="button" onClick={handleSave}>
                                Сохранить
                            </Button>
                        ) : null}
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Отмена
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
