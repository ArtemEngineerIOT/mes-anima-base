import { useState } from "react";

import { useMonitoringLineMeters } from "@/features/operator/order-execution/model/monitoring/use-monitoring-line-meters";
import { useMonitoringRollTables } from "@/features/operator/order-execution/model/monitoring/use-monitoring-roll-tables";
import { useMonitoringStageEvents } from "@/features/operator/order-execution/model/monitoring/use-monitoring-stage-events";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { Informer } from "@/shared/ui/kit/informer";
import {
    dataTableBodyCellClassName,
    dataTableHeadCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { InformerPill } from "@/shared/ui/kit/informer-pill";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cn } from "@/shared/lib/css";
import { monitoringStatPillVariant, monitoringStatToInformerTone } from "../model/monitoring-tone-map";
import { useOrderExecutionMachineStompState } from "../model/machine-stomp/order-execution-machine-stomp-context";
import { resolveMonitoringMachineParams } from "../model/machine-stomp/resolve-monitoring-machine-params";
import type { MachineData, MachineId } from "../model/types";
import { OrderExecutionTechnologicalParamsModal } from "./modal/order-execution-technological-params-modal";
import { OrderExecutionSimpleTable } from "./simple-table";

type OrderExecutionMonitoringProps = {
    machineId: MachineId;
    workAreaId?: string;
    monitoring: MachineData["monitoring"];
};

export function OrderExecutionMonitoring({ machineId, workAreaId }: OrderExecutionMonitoringProps) {
    const [techParamsOpen, setTechParamsOpen] = useState(false);
    const machineStompState = useOrderExecutionMachineStompState();
    const machineParams = resolveMonitoringMachineParams(machineStompState);
    const { lineMeters, isLoading: isLineMetersLoading, error: lineMetersError } = useMonitoringLineMeters({
        workAreaId,
    });
    const {
        rollTables,
        isLoading: isRollTablesLoading,
        error: rollTablesError,
    } = useMonitoringRollTables({ workAreaId });
    const {
        stageEvents,
        isLoading: isStageEventsLoading,
        error: stageEventsError,
    } = useMonitoringStageEvents({ workAreaId });

    const formatLength = (value: number) => (isLineMetersLoading ? "…" : `${value} м`);
    const formatRollLength = (value: number) => (isRollTablesLoading ? "…" : `${value}`);
    const formatStageEventQuantity = (value: number) => (isStageEventsLoading ? "…" : String(value));

    return (
        <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden py-0">
            <CardHeader className="shrink-0 gap-0 border-b bg-card px-4 py-3 shadow-[0_8px_12px_-12px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between gap-0">
                    <CardTitle className={cnSectionBlockTitle()}>Мониторинг</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
                <div className="app-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-4 pb-4 pt-3">
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
                                                                (param.tone
                                                                    ? monitoringStatToInformerTone(param.tone)
                                                                    : "system")
                                                            }
                                                            variant={
                                                                param.pillVariant ??
                                                                monitoringStatPillVariant(param.tone)
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
                    </section>

                    <div className="border-t border-border py-3" aria-hidden />

                <section className="flex flex-col gap-2">
                    <div className="flex justify-end">
                        <Button type="button" size="sm" onClick={() => setTechParamsOpen(true)}>
                            Показать все
                        </Button>
                    </div>
                    {lineMetersError ? (
                        <Informer tone="alert" variant="filled" size="s" title="Метраж входа и выхода" description={lineMetersError} />
                    ) : null}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className={dataTableScrollViewportClassName}>
                            <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-1/2")}>Вход на линию</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-1/2 text-right")}>Длина</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>Вход общий</TableCell>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                        {formatLength(lineMeters.inLine.totalM)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>Вход ролик</TableCell>
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
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-1/2")}>Выход с линии</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-1/2 text-right")}>Длина</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>Выход общий</TableCell>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                        {formatLength(lineMeters.outLine.totalM)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>Выход ролик</TableCell>
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
                            { key: "label", label: "Дата" },
                            { key: "uom", label: "Ед.изм", align: "center" },
                            { key: "quantity", label: "Кол-во", align: "right" },
                        ]}
                        rows={stageEvents.map((event) => ({
                            label: event.label,
                            uom: isStageEventsLoading ? "…" : event.uom,
                            quantity: formatStageEventQuantity(event.quantity),
                        }))}
                        emptyText={isStageEventsLoading ? "Загрузка…" : "Нет данных"}
                    />
                </div>
                </div>
            </CardContent>

            <OrderExecutionTechnologicalParamsModal
                machineId={machineId}
                open={techParamsOpen}
                onOpenChange={setTechParamsOpen}
            />
        </Card>
    );
}
