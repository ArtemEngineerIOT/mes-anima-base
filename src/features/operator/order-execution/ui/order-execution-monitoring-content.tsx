import { useEffect, type MutableRefObject } from "react";

import { useMonitoringLineMeters } from "@/features/operator/order-execution/model/monitoring/use-monitoring-line-meters";
import { useMonitoringRollTables } from "@/features/operator/order-execution/model/monitoring/use-monitoring-roll-tables";
import { useMonitoringStageEvents } from "@/features/operator/order-execution/model/monitoring/use-monitoring-stage-events";
import { Button } from "@/shared/ui/kit/button";
import { Informer } from "@/shared/ui/kit/informer";
import { InformerPill } from "@/shared/ui/kit/informer-pill";
import {
    dataTableBodyCellClassName,
    dataTableInsetShellClassName,
    dataTableStickyHeadCellClassName,
    dataTableViewportFooterClassName,
    dataTableViewportShellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cn } from "@/shared/lib/css";

import { openOrderExecutionMonitoringTab } from "../model/monitoring/build-order-execution-monitoring-url";
import { useOrderExecutionMachineStompState } from "../model/machine-stomp/order-execution-machine-stomp-context";
import { resolveMonitoringMachineParams } from "../model/machine-stomp/resolve-monitoring-machine-params";
import { monitoringStatPillVariant, monitoringStatToInformerTone } from "../model/monitoring-tone-map";
import type { MachineId } from "../model/types";

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
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-[70%]")}>
                                        Характеристика
                                    </TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-[30%] text-right")}>
                                        Значение
                                    </TableHead>
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
                                                            (param.tone
                                                                ? monitoringStatToInformerTone(param.tone)
                                                                : "system")
                                                        }
                                                        variant={
                                                            param.pillVariant ?? monitoringStatPillVariant(param.tone)
                                                        }
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
                    </div>
                    {showShowAllButton ? (
                        <div className={cn(dataTableViewportFooterClassName, "flex justify-end py-2")}>
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
                </div>
            </section>

            <div className="border-t border-border py-3" aria-hidden />

            <section className="flex flex-col gap-2">
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
                    <div className={dataTableViewportShellClassName}>
                        <div className="min-w-0 overflow-x-auto">
                            <Table
                                className={cn(
                                    dataTableInsetShellClassName,
                                    "w-full border-separate border-spacing-0 text-[12px]",
                                )}
                            >
                                <TableHeader className="bg-muted/40">
                                    <TableRow className="hover:!bg-transparent">
                                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-[70%]")}>
                                            Вход на линию
                                        </TableHead>
                                        <TableHead
                                            className={cn(dataTableStickyHeadCellClassName, "w-[30%] text-right")}
                                        >
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
                    </div>

                    <div className={dataTableViewportShellClassName}>
                        <div className="min-w-0 overflow-x-auto">
                            <Table
                                className={cn(
                                    dataTableInsetShellClassName,
                                    "w-full border-separate border-spacing-0 text-[12px]",
                                )}
                            >
                                <TableHeader className="bg-muted/40">
                                    <TableRow className="hover:!bg-transparent">
                                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-[70%]")}>
                                            Выход с линии
                                        </TableHead>
                                        <TableHead
                                            className={cn(dataTableStickyHeadCellClassName, "w-[30%] text-right")}
                                        >
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
                                            Последний ролик
                                        </TableCell>
                                        <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                            {formatLength(lineMeters.outLine.rollOutM)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </section>

            <div className="border-t border-border py-3" aria-hidden />

            {rollTablesError ? (
                <Informer tone="alert" variant="filled" size="s" title="Таблицы рулонов" description={rollTablesError} />
            ) : null}

            <div className="grid grid-cols-1 items-start gap-x-3 gap-y-2 md:grid-cols-2 md:grid-rows-[auto_auto]">
                <div className={cnSectionBlockTitle("md:col-start-1 md:row-start-1")}>Входные рулоны</div>
                <div className={cn(dataTableViewportShellClassName, "md:col-start-1 md:row-start-2")}>
                    <div className="min-w-0 overflow-x-auto">
                        <Table
                            className={cn(
                                dataTableInsetShellClassName,
                                "w-full border-separate border-spacing-0 text-[12px]",
                            )}
                        >
                            <TableHeader className="bg-muted/40">
                                <TableRow className="hover:!bg-transparent">
                                    <TableHead className={dataTableStickyHeadCellClassName}>Рулон</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>
                                        Длина
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isRollTablesLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={2}
                                            className={cn(
                                                dataTableBodyCellClassName,
                                                "py-6 text-center text-muted-foreground",
                                            )}
                                        >
                                            Загрузка…
                                        </TableCell>
                                    </TableRow>
                                ) : rollTables.inputRolls.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={2}
                                            className={cn(
                                                dataTableBodyCellClassName,
                                                "py-6 text-center text-muted-foreground",
                                            )}
                                        >
                                            Нет данных
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rollTables.inputRolls.map((row) => (
                                        <TableRow key={row.roll}>
                                            <TableCell className={dataTableBodyCellClassName}>{row.roll}</TableCell>
                                            <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                                {formatRollLength(row.lengthM)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className={cnSectionBlockTitle("md:col-start-2 md:row-start-1")}>Выходные рулоны</div>
                <div className={cn(dataTableViewportShellClassName, "md:col-start-2 md:row-start-2")}>
                    <div className="min-w-0 overflow-x-auto">
                        <Table
                            className={cn(
                                dataTableInsetShellClassName,
                                "w-full border-separate border-spacing-0 text-[12px]",
                            )}
                        >
                            <TableHeader className="bg-muted/40">
                                <TableRow className="hover:!bg-transparent">
                                    <TableHead className={dataTableStickyHeadCellClassName}>Рулон</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>
                                        Длина
                                    </TableHead>
                                    <TableHead className={dataTableStickyHeadCellClassName}>Состав</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isRollTablesLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className={cn(
                                                dataTableBodyCellClassName,
                                                "py-6 text-center text-muted-foreground",
                                            )}
                                        >
                                            Загрузка…
                                        </TableCell>
                                    </TableRow>
                                ) : rollTables.outputRolls.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className={cn(
                                                dataTableBodyCellClassName,
                                                "py-6 text-center text-muted-foreground",
                                            )}
                                        >
                                            Нет данных
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rollTables.outputRolls.map((row) => (
                                        <TableRow
                                            key={row.roll}
                                            className={row.blocked ? "bg-destructive/10 text-destructive" : undefined}
                                        >
                                            <TableCell className={dataTableBodyCellClassName}>{row.roll}</TableCell>
                                            <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                                {formatRollLength(row.lengthM)}
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>
                                                {row.composition ?? "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <div className="border-t border-border py-3" aria-hidden />

            {stageEventsError ? (
                <Informer tone="alert" variant="filled" size="s" title="События по этапу" description={stageEventsError} />
            ) : null}

            <div className="grid gap-2">
                <div className={cnSectionBlockTitle()}>События по этапу</div>
                <div className={dataTableViewportShellClassName}>
                    <div className="min-w-0 overflow-x-auto">
                        <Table
                            className={cn(
                                dataTableInsetShellClassName,
                                "w-full border-separate border-spacing-0 text-[12px]",
                            )}
                        >
                            <TableHeader className="bg-muted/40">
                                <TableRow className="hover:!bg-transparent">
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-[50%]")}>
                                        Наименование
                                    </TableHead>
                                    <TableHead
                                        className={cn(dataTableStickyHeadCellClassName, "w-[25%] text-right")}
                                    >
                                        Кол-во
                                    </TableHead>
                                    <TableHead
                                        className={cn(dataTableStickyHeadCellClassName, "w-[25%] text-center")}
                                    >
                                        Ед.изм.
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isStageEventsLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className={cn(
                                                dataTableBodyCellClassName,
                                                "py-6 text-center text-muted-foreground",
                                            )}
                                        >
                                            Загрузка…
                                        </TableCell>
                                    </TableRow>
                                ) : stageEvents.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className={cn(
                                                dataTableBodyCellClassName,
                                                "py-6 text-center text-muted-foreground",
                                            )}
                                        >
                                            Нет данных
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stageEvents.map((event) => (
                                        <TableRow key={event.label}>
                                            <TableCell
                                                className={cn(dataTableBodyCellClassName, "text-muted-foreground")}
                                            >
                                                {event.label}
                                            </TableCell>
                                            <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                                {formatStageEventQuantity(event.quantity)}
                                            </TableCell>
                                            <TableCell className={cn(dataTableBodyCellClassName, "text-center")}>
                                                {event.uom}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
