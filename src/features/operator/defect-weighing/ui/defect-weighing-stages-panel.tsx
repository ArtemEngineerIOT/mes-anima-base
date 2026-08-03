import { useEffect } from "react";

import { useDataTablePagination } from "@/shared/lib/data-table-pagination";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { DataTablePaginationFooter } from "@/shared/ui/kit/data-table-pagination-footer";
import { DataTableViewport } from "@/shared/ui/kit/data-table-viewport";
import { Icon } from "@/shared/ui/kit/icon";
import { Input } from "@/shared/ui/kit/input";
import { Informer } from "@/shared/ui/kit/informer";
import {
    dataTableBodyCellClassName,
    dataTableHeadCellClassName,
    dataTableInsetShellClassName,
    dataTableSplitScrollBodyClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import type { DefectWeighingModel } from "../model/use-defect-weighing";

type DefectWeighingStagesPanelProps = {
    model: DefectWeighingModel;
};

const COLUMN_COUNT = 9;
const selectionColumnClassName = "w-10";
const orderColumnClassName = "w-[64px] max-w-[64px]";
const operationIdColumnClassName = "w-[80px] max-w-[80px]";

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

    const { pageItems, pagination, pageSize, setPageSize, setPage } = useDataTablePagination(filteredStages, {
        initialPageSize: 10,
    });

    useEffect(() => {
        setPage(1);
    }, [setPage, stageQuery]);

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
            {stagesError ? (
                <Informer tone="alert" variant="bordered" size="s" title="Ошибка загрузки этапов" description={stagesError} />
            ) : null}

            <div className="flex shrink-0 items-center gap-2">
                <div className="relative min-w-0 flex-1">
                    <Icon
                        name="search"
                        className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-lg text-muted-foreground"
                    />
                    <Input
                        className="pl-9"
                        placeholder="Поиск по заказу, ID этапа, клиенту, продукту…"
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

            <DataTableViewport
                layout="fill"
                className="min-h-0 flex-1"
                footer={
                    <DataTablePaginationFooter
                        totalCount={pagination.totalCount}
                        rangeStart={pagination.rangeStart}
                        rangeEnd={pagination.rangeEnd}
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                    />
                }
            >
                <Table
                    className={cn(
                        dataTableInsetShellClassName,
                        "min-w-[760px] border-separate border-spacing-0 text-[12px]",
                    )}
                >
                    <TableHeader>
                        <TableRow className="hover:!bg-transparent">
                            <TableHead
                                className={cn(dataTableHeadCellClassName, "bg-muted/40", selectionColumnClassName)}
                                aria-label="Выбор"
                            />
                            <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40", orderColumnClassName)}>
                                Заказ
                            </TableHead>
                            <TableHead
                                className={cn(dataTableHeadCellClassName, "bg-muted/40", operationIdColumnClassName)}
                            >
                                ID этапа
                            </TableHead>
                            <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Дата заказа</TableHead>
                            <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Клиент</TableHead>
                            <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40 min-w-[180px]")}>
                                Продукт
                            </TableHead>
                            <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Количество</TableHead>
                            <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Старт</TableHead>
                            <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Завершение</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className={dataTableSplitScrollBodyClassName}>
                        {stagesLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={COLUMN_COUNT}
                                    className={cn(dataTableBodyCellClassName, "py-8 text-center text-muted-foreground")}
                                >
                                    Загрузка этапов…
                                </TableCell>
                            </TableRow>
                        ) : pageItems.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={COLUMN_COUNT}
                                    className={cn(dataTableBodyCellClassName, "py-8 text-center text-muted-foreground")}
                                >
                                    Нет этапов за выбранный период
                                </TableCell>
                            </TableRow>
                        ) : (
                            pageItems.map((row) => {
                                const isSelected = selectedStageId === row.id;
                                return (
                                    <TableRow
                                        key={row.id}
                                        className={cn("cursor-pointer", isSelected && "bg-accent/40")}
                                        onClick={() => setSelectedStageId(row.id)}
                                    >
                                        <TableCell className={cn(dataTableBodyCellClassName, selectionColumnClassName)}>
                                            <input
                                                type="radio"
                                                name="defect-weighing-stage"
                                                checked={isSelected}
                                                onChange={() => setSelectedStageId(row.id)}
                                                onClick={(event) => event.stopPropagation()}
                                                aria-label={`Выбрать этап ${row.orderId}`}
                                            />
                                        </TableCell>
                                        <TableCell className={cn(dataTableBodyCellClassName, orderColumnClassName, "truncate")} title={row.orderId}>
                                            {row.orderId}
                                        </TableCell>
                                        <TableCell
                                            className={cn(dataTableBodyCellClassName, operationIdColumnClassName, "truncate")}
                                            title={row.operationId}
                                        >
                                            {row.operationId}
                                        </TableCell>
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
            </DataTableViewport>

            <div className="flex shrink-0 justify-end">
                <Button type="button" size="sm" variant="outline" onClick={() => void reloadStages()}>
                    Обновить этапы
                </Button>
            </div>
        </div>
    );
}
