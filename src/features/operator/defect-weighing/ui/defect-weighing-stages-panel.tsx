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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import type { DefectWeighingModel } from "../model/use-defect-weighing";

type DefectWeighingStagesPanelProps = {
    model: DefectWeighingModel;
};

export function DefectWeighingStagesPanel({ model }: DefectWeighingStagesPanelProps) {
    const {
        stagesLoading,
        stagesError,
        reloadStages,
        stageQuery,
        setStageQuery,
        filteredStages,
        selectedStageId,
        setSelectedStageId,
    } = model;

    return (
        <div className="flex min-h-0 flex-col gap-3">
            {stagesError ? (
                <Informer tone="alert" variant="bordered" size="s" title="Ошибка загрузки этапов" description={stagesError} />
            ) : null}

            <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1">
                    <Icon
                        name="search"
                        className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-lg text-muted-foreground"
                    />
                    <Input
                        className="pl-9"
                        placeholder="Поиск по заказу, клиенту, продукту…"
                        value={stageQuery}
                        onChange={(event) => setStageQuery(event.target.value)}
                        aria-label="Поиск в таблице этапов"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="shrink-0"
                    onClick={() => setStageQuery("")}
                    aria-label="Очистить поиск"
                >
                    <Icon name="delete_sweep" className="text-base" />
                </Button>
            </div>

            <div className={dataTableScrollViewportClassName}>
                <Table className={cn(dataTableShellClassName, "min-w-[760px] text-[12px]")}>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className={cn(dataTableStickyHeadCellClassName, "w-10")} aria-label="Выбор" />
                            <TableHead className={dataTableStickyHeadCellClassName}>Заказ</TableHead>
                            <TableHead className={dataTableStickyHeadCellClassName}>Дата заказа</TableHead>
                            <TableHead className={dataTableStickyHeadCellClassName}>Клиент</TableHead>
                            <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[180px]")}>Продукт</TableHead>
                            <TableHead className={dataTableStickyHeadCellClassName}>Количество</TableHead>
                            <TableHead className={dataTableStickyHeadCellClassName}>Старт</TableHead>
                            <TableHead className={dataTableStickyHeadCellClassName}>Завершение</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stagesLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className={cn(dataTableBodyCellClassName, "text-center text-muted-foreground")}
                                >
                                    Загрузка этапов…
                                </TableCell>
                            </TableRow>
                        ) : filteredStages.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className={cn(dataTableBodyCellClassName, "text-center text-muted-foreground")}
                                >
                                    Нет этапов за выбранный период
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStages.map((row) => {
                                const isSelected = selectedStageId === row.id;
                                return (
                                    <TableRow
                                        key={row.id}
                                        className={cn(isSelected && "bg-primary/10")}
                                        onClick={() => setSelectedStageId(row.id)}
                                    >
                                        <TableCell className={dataTableBodyCellClassName}>
                                            <input
                                                type="radio"
                                                name="defect-weighing-stage"
                                                checked={isSelected}
                                                onChange={() => setSelectedStageId(row.id)}
                                                aria-label={`Выбрать этап ${row.orderId}`}
                                            />
                                        </TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.orderId}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.orderDate}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.client}</TableCell>
                                        <TableCell
                                            className={cn(dataTableBodyCellClassName, "max-w-[220px] truncate")}
                                            title={row.product}
                                        >
                                            {row.product}
                                        </TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.quantity}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.startAt}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.endAt}</TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-end">
                <Button type="button" size="sm" variant="outline" onClick={() => void reloadStages()}>
                    Обновить этапы
                </Button>
            </div>
        </div>
    );
}
