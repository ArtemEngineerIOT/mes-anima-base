import { useEffect, type MutableRefObject } from "react";

import { useMonitoringLineMeters } from "@/features/operator/order-execution/model/monitoring/use-monitoring-line-meters";
import { useMonitoringRollTables } from "@/features/operator/order-execution/model/monitoring/use-monitoring-roll-tables";
import { useMonitoringStageEvents } from "@/features/operator/order-execution/model/monitoring/use-monitoring-stage-events";
import { Button } from "@/shared/ui/kit/button";
import { Informer } from "@/shared/ui/kit/informer";
import { InformerPill } from "@/shared/ui/kit/informer-pill";
import {
    dataTableBodyCellClassName,
    dataTableHeadCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cn } from "@/shared/lib/css";

import { openOrderExecutionMonitoringTab } from "../model/monitoring/build-order-execution-monitoring-url";
import { useOrderExecutionMachineStompState } from "../model/machine-stomp/order-execution-machine-stomp-context";
import { resolveMonitoringMachineParams } from "../model/machine-stomp/resolve-monitoring-machine-params";
import { monitoringStatPillVariant, monitoringStatToInformerTone } from "../model/monitoring-tone-map";
import type { MachineId } from "../model/types";
import { OrderExecutionSimpleTable } from "./simple-table";

type OrderExecutionMonitoringContentProps = {
    machineId: MachineId;
    workAreaId?: string;
    showShowAllButton?: boolean;
    /** Регистрирует silent-reload summary (getArmExecutionMonitoringSummary) */
    lineMetersSilentReloadRef?: MutableRefObject<(() => void) | null>;
    /** Регистрирует silent-reload таблиц рулонов (getArmExecutionMonitoringRollTables) */
    rollTablesSilentReloadRef?: MutableRefObject<(() => void) | null>;
};

export function OrderExecutionMonitoringContent({
    machineId,
    workAreaId,
    showShowAllButton = false,
    lineMetersSilentReloadRef,
    rollTablesSilentReloadRef,
}: OrderExecutionMonitoringContentProps) {
    const machineStompState = useOrderExecutionMachineStompState();
    const machineParams = resolveMonitoringMachineParams(machineStompState);
    const { lineMeters, isLoading: isLineMetersLoading, error: lineMetersError, reload } = useMonitoringLineMeters({
        workAreaId,
    });

    useEffect(() => {
        if (!lineMetersSilentReloadRef) {
            return;
        }
        lineMetersSilentReloadRef.current = () => {
            void reload({ silent: true });
        };
        return () => {
            lineMetersSilentReloadRef.current = null;
        };
    }, [lineMetersSilentReloadRef, reload]);
    const {
        rollTables,
        isLoading: isRollTablesLoading,
        error: rollTablesError,
        reload: reloadRollTables,
    } = useMonitoringRollTables({ workAreaId });

    useEffect(() => {
        if (!rollTablesSilentReloadRef) {
            return;
        }
        rollTablesSilentReloadRef.current = () => {
            void reloadRollTables({ silent: true });
        };
        return () => {
            rollTablesSilentReloadRef.current = null;
        };
    }, [rollTablesSilentReloadRef, reloadRollTables]);
    const {
        stageEvents,
        isLoading: isStageEventsLoading,
        error: stageEventsError,
    } = useMonitoringStageEvents({ workAreaId });

    const formatLength = (value: number) => (isLineMetersLoading ? "…" : `${value} м`);
    const formatRollLength = (value: number) => (isRollTablesLoading ? "…" : `${value}`);
    const formatStageEventQuantity = (value: number) => (isStageEventsLoading ? "…" : String(value));

    const canOpenMonitoringTab = Boolean(machineId);

    return (
        <div className="flex flex-col gap-3">
            <section className="space-y-2">
                <div className={cnSectionBlockTitle("pb-2")}>Данные с машины</div>
                <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className={cn(dataTableHeadCellClassName, "w-1/2")}>Характеристика</TableHead>
                            <TableHead className={cn(dataTableHeadCellClassName, "w-1/2 text-right")}>Значение</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {machineParams.map((param) => (
                            <TableRow key={param.label}>
                                <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>
                                    {param.label}
                                </TableCell>
                                <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                    {param.showAsPill ? (
                                        <div className="flex justify-end">
                                            <InformerPill
                                                tone={
                                                    param.informerTone ??
                                                    (param.tone ? monitoringStatToInformerTone(param.tone) : "system")
                                                }
                                                variant={param.pillVariant ?? monitoringStatPillVariant(param.tone)}
                                            >
                                                {param.value}
                                            </InformerPill>
                                        </div>
                                    ) : (
                                        param.value
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>

            <div className="border-t border-border py-3" aria-hidden />

            <section className="flex flex-col gap-2">
                {showShowAllButton ? (
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            size="sm"
                            disabled={!canOpenMonitoringTab}
                            onClick={() => {
                                openOrderExecutionMonitoringTab({ machineId, workAreaId });
                            }}
                        >
                            Показать все
                        </Button>
                    </div>
                ) : null}
                {lineMetersError ? (
                    <Informer
                        tone="alert"
                        variant="filled"
                        size="s"
                        title="Метраж входа и выхода"
                        description={lineMetersError}
                    />
                ) : null}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className={dataTableScrollViewportClassName}>
                        <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-1/2")}>
                                        Вход на линию
                                    </TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-1/2 text-right")}>
                                        Длина
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>
                                        Вход общий
                                    </TableCell>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                        {formatLength(lineMeters.inLine.totalM)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>
                                        Вход ролик
                                    </TableCell>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                        {formatLength(lineMeters.inLine.rollInM)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    <div className={dataTableScrollViewportClassName}>
                        <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-1/2")}>
                                        Выход с линии
                                    </TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-1/2 text-right")}>
                                        Длина
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>
                                        Выход общий
                                    </TableCell>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                        {formatLength(lineMeters.outLine.totalM)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>
                                        Выход ролик
                                    </TableCell>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                        {formatLength(lineMeters.outLine.rollOutM)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </section>

            <div className="border-t border-border py-3" aria-hidden />

            {rollTablesError ? (
                <Informer tone="alert" variant="filled" size="s" title="Таблицы рулонов" description={rollTablesError} />
            ) : null}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                    <div className={cnSectionBlockTitle("pb-2")}>Входные рулоны</div>
                    <OrderExecutionSimpleTable
                        columns={[
                            { key: "roll", label: "Рулон" },
                            { key: "length", label: "Длина", align: "right" },
                        ]}
                        rows={rollTables.inputRolls.map((w) => ({
                            roll: w.roll,
                            length: formatRollLength(w.lengthM),
                        }))}
                        emptyText={isRollTablesLoading ? "Загрузка…" : "Нет данных"}
                    />
                </div>
                <div>
                    <div className={cnSectionBlockTitle("pb-2")}>Выходные рулоны</div>
                    <OrderExecutionSimpleTable
                        columns={[
                            { key: "roll", label: "Рулон" },
                            { key: "length", label: "Длина", align: "right" },
                            { key: "composition", label: "Состав" },
                            { key: "reason", label: "Причина" },
                        ]}
                        rows={rollTables.outputRolls.map((o) => {
                            const reasonText = o.reason?.trim();
                            const showAlertPill =
                                Boolean(o.blocked) ||
                                (Boolean(reasonText) && reasonText !== "—" && reasonText !== "-");
                            return {
                                roll: o.roll,
                                length: formatRollLength(o.lengthM),
                                composition: o.composition ?? "—",
                                reason: showAlertPill ? (
                                    <InformerPill tone="alert" variant="filled">
                                        {reasonText}
                                    </InformerPill>
                                ) : (
                                    (reasonText ?? "—")
                                ),
                            };
                        })}
                        emptyText={isRollTablesLoading ? "Загрузка…" : "Нет данных"}
                    />
                </div>
            </div>

            <div className="border-t border-border py-3" aria-hidden />

            {stageEventsError ? (
                <Informer tone="alert" variant="filled" size="s" title="События по этапу" description={stageEventsError} />
            ) : null}

            <div>
                <div className={cnSectionBlockTitle("pb-2")}>События по этапу</div>
                <OrderExecutionSimpleTable
                    columns={[
                        { key: "label", label: "Наименование" },
                        { key: "quantity", label: "Кол-во", align: "right" },
                        { key: "uom", label: "Ед.изм.", align: "center" },
                    ]}
                    rows={stageEvents.map((event) => ({
                        label: event.label,
                        quantity: formatStageEventQuantity(event.quantity),
                        uom: isStageEventsLoading ? "…" : event.uom,
                    }))}
                    emptyText={isStageEventsLoading ? "Загрузка…" : "Нет данных"}
                />
            </div>
        </div>
    );
}
