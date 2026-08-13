import { memo, useEffect, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/shared/lib/css";
import { useDataTablePagination } from "@/shared/lib/data-table-pagination";
import { DataTablePaginationFooter } from "@/shared/ui/kit/data-table-pagination-footer";
import { DataTableViewport } from "@/shared/ui/kit/data-table-viewport";
import { InformerPill } from "@/shared/ui/kit/informer-pill";
import {
    dataTableBodyCellClassName,
    dataTableHeadCellClassName,
    dataTableInsetShellClassName,
    dataTableSplitScrollBodyClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import type { ProductionStage, StageStatus } from "../model/types";
import {
    productionStageStatusLabel,
    stageStatusInformerTone,
    stageStatusInformerVariant,
} from "../model/stage-status";
import { ProductionPlanStatusColumnHead } from "./production-plan-status-column-head";

type ProductionPlanTableProps = {
    stages: ProductionStage[];
    searchQuery: string;
    selectedId: string | null;
    selectedStatuses: readonly StageStatus[];
    onToggleStatus: (status: StageStatus) => void;
    onClearStatuses: () => void;
    onSelect: (stageId: string | null) => void;
};

const COLUMN_COUNT = 13;

/**
 * Доли ширины колонок (сумма 100%; split-scroll: одинаковые style на th и td).
 */
const PRODUCTION_PLAN_COLUMN_WIDTHS = [
    "3%",
    "8%",
    "8%",
    "11%",
    "8%",
    "5%",
    "5%",
    "18%",
    "5%",
    "5%",
    "6%",
    "9%",
    "9%",
] as const;

function productionPlanColumnWidthStyle(columnIndex: number): CSSProperties {
    const width = PRODUCTION_PLAN_COLUMN_WIDTHS[columnIndex];

    return {
        width,
        minWidth: width,
        maxWidth: width,
    };
}

/** Базовые стили шапки: единый шрифт, высота, без переноса. */
const tableHeadCellClassName = cn(
    dataTableHeadCellClassName,
    "bg-muted/40 whitespace-nowrap px-2 py-2 align-middle",
);

/** Базовые стили тела: тот же кегль 12px, что у шапки и таблицы. */
const tableBodyCellClassName = cn(dataTableBodyCellClassName, "px-2 py-2 text-[12px]");

/** Доп. классы колонок — одинаковые на th и td. */
const selectionColClassName = "shrink-0 overflow-hidden";
const statusColClassName = "shrink-0 overflow-hidden";
const dateColClassName = "shrink-0 overflow-hidden whitespace-nowrap";
const clientColClassName = "shrink-0 overflow-hidden";
const clientNumberColClassName = "shrink-0 overflow-hidden";
const stageIdColClassName = "shrink-0 overflow-hidden";
const stageNameColClassName = "shrink-0 overflow-hidden";
const productColClassName = "shrink-0 overflow-hidden";
const quantityColClassName = "shrink-0 overflow-hidden whitespace-nowrap text-right";
const unitColClassName = "shrink-0 overflow-hidden whitespace-nowrap";
const machineColClassName = "shrink-0 overflow-hidden";
const endDateColClassName = "shrink-0 overflow-hidden whitespace-nowrap";

/** Компактный кегль только в ячейках тела для дат. */
const dateBodyCellClassName = cn(tableBodyCellClassName, dateColClassName, "text-[11px]");
const endDateBodyCellClassName = cn(tableBodyCellClassName, endDateColClassName, "text-[11px]");
const statusBodyCellClassName = cn(tableBodyCellClassName, statusColClassName, "align-top");

function truncateCellContent(value: ReactNode, title?: string) {
    return (
        <span className="block truncate" title={title}>
            {value}
        </span>
    );
}

export const ProductionPlanTable = memo(function ProductionPlanTable({
    stages,
    searchQuery,
    selectedId,
    selectedStatuses,
    onToggleStatus,
    onClearStatuses,
    onSelect,
}: ProductionPlanTableProps) {
    const { pageItems, pagination, pageSize, setPageSize, setPage } = useDataTablePagination(stages);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, stages, selectedStatuses, setPage]);

    return (
        <DataTableViewport
            layout="fill"
            className="min-h-0 w-full flex-1 [&_.data-table-split-scroll]:overflow-x-hidden"
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
                    "w-full border-separate border-spacing-0 text-[12px]",
                )}
            >
                <TableHeader className="bg-muted/40">
                    <TableRow className="hover:!bg-transparent">
                        <TableHead
                            className={cn(tableHeadCellClassName, selectionColClassName)}
                            style={productionPlanColumnWidthStyle(0)}
                            aria-label="select"
                        />
                        <TableHead
                            className={cn(tableHeadCellClassName, statusColClassName)}
                            style={productionPlanColumnWidthStyle(1)}
                        >
                            <ProductionPlanStatusColumnHead
                                selectedStatuses={selectedStatuses}
                                onToggleStatus={onToggleStatus}
                                onClearStatuses={onClearStatuses}
                            />
                        </TableHead>
                        <TableHead
                            className={cn(tableHeadCellClassName, dateColClassName)}
                            style={productionPlanColumnWidthStyle(2)}
                        >
                            Дата заказа
                        </TableHead>
                        <TableHead
                            className={cn(tableHeadCellClassName, clientColClassName)}
                            style={productionPlanColumnWidthStyle(3)}
                        >
                            Клиент
                        </TableHead>
                        <TableHead
                            className={cn(tableHeadCellClassName, clientNumberColClassName)}
                            style={productionPlanColumnWidthStyle(4)}
                        >
                            Номер клиента
                        </TableHead>
                        <TableHead
                            className={cn(tableHeadCellClassName, stageIdColClassName)}
                            style={productionPlanColumnWidthStyle(5)}
                        >
                            ID этапа
                        </TableHead>
                        <TableHead
                            className={cn(tableHeadCellClassName, stageNameColClassName)}
                            style={productionPlanColumnWidthStyle(6)}
                        >
                            Этап
                        </TableHead>
                        <TableHead
                            className={cn(tableHeadCellClassName, productColClassName)}
                            style={productionPlanColumnWidthStyle(7)}
                        >
                            Продукт
                        </TableHead>
                        <TableHead
                            className={cn(tableHeadCellClassName, quantityColClassName)}
                            style={productionPlanColumnWidthStyle(8)}
                        >
                            Кол-во
                        </TableHead>
                        <TableHead
                            className={cn(tableHeadCellClassName, unitColClassName)}
                            style={productionPlanColumnWidthStyle(9)}
                        >
                            Ед. изм.
                        </TableHead>
                        <TableHead
                            className={cn(tableHeadCellClassName, machineColClassName)}
                            style={productionPlanColumnWidthStyle(10)}
                        >
                            Машина
                        </TableHead>
                        <TableHead
                            className={cn(tableHeadCellClassName, dateColClassName)}
                            style={productionPlanColumnWidthStyle(11)}
                        >
                            Старт
                        </TableHead>
                        <TableHead
                            className={cn(tableHeadCellClassName, endDateColClassName)}
                            style={productionPlanColumnWidthStyle(12)}
                        >
                            Завершение
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className={dataTableSplitScrollBodyClassName}>
                    {pageItems.map((stage) => (
                        <TableRow
                            key={`${stage.workAreaId}:${stage.stageId}`}
                            className={cn(
                                "cursor-pointer",
                                selectedId === stage.stageId && "bg-accent/40",
                            )}
                            onClick={() => onSelect(stage.stageId)}
                        >
                            <TableCell
                                className={cn(tableBodyCellClassName, selectionColClassName)}
                                style={productionPlanColumnWidthStyle(0)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedId === stage.stageId}
                                    onChange={(event) =>
                                        onSelect(event.target.checked ? stage.stageId : null)
                                    }
                                    onClick={(event) => event.stopPropagation()}
                                />
                            </TableCell>
                            <TableCell
                                className={statusBodyCellClassName}
                                style={productionPlanColumnWidthStyle(1)}
                            >
                                <InformerPill
                                    tone={stageStatusInformerTone(stage.status)}
                                    variant={stageStatusInformerVariant(stage.status)}
                                >
                                    {productionStageStatusLabel(stage)}
                                </InformerPill>
                                {stage.hasPrevUnfinished && (
                                    <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-200">
                                        Есть невыполненные этапы перед ним
                                    </div>
                                )}
                            </TableCell>
                            <TableCell
                                className={dateBodyCellClassName}
                                style={productionPlanColumnWidthStyle(2)}
                            >
                                {stage.orderDate ?? "—"}
                            </TableCell>
                            <TableCell
                                className={cn(tableBodyCellClassName, clientColClassName)}
                                style={productionPlanColumnWidthStyle(3)}
                            >
                                {truncateCellContent(stage.client ?? "—", stage.client ?? undefined)}
                            </TableCell>
                            <TableCell
                                className={cn(tableBodyCellClassName, clientNumberColClassName)}
                                style={productionPlanColumnWidthStyle(4)}
                            >
                                {truncateCellContent(
                                    stage.clientNumber ?? "—",
                                    stage.clientNumber ?? undefined,
                                )}
                            </TableCell>
                            <TableCell
                                className={cn(tableBodyCellClassName, stageIdColClassName)}
                                style={productionPlanColumnWidthStyle(5)}
                            >
                                {truncateCellContent(stage.stageId, stage.stageId)}
                            </TableCell>
                            <TableCell
                                className={cn(tableBodyCellClassName, stageNameColClassName)}
                                style={productionPlanColumnWidthStyle(6)}
                            >
                                {truncateCellContent(stage.stageName, stage.stageName)}
                            </TableCell>
                            <TableCell
                                className={cn(tableBodyCellClassName, productColClassName)}
                                style={productionPlanColumnWidthStyle(7)}
                            >
                                {truncateCellContent(stage.product ?? "—", stage.product ?? undefined)}
                            </TableCell>
                            <TableCell
                                className={cn(tableBodyCellClassName, quantityColClassName)}
                                style={productionPlanColumnWidthStyle(8)}
                            >
                                {stage.quantity?.toLocaleString("ru-RU") ?? "—"}
                            </TableCell>
                            <TableCell
                                className={cn(tableBodyCellClassName, unitColClassName)}
                                style={productionPlanColumnWidthStyle(9)}
                            >
                                {stage.unit ?? "—"}
                            </TableCell>
                            <TableCell
                                className={cn(tableBodyCellClassName, machineColClassName)}
                                style={productionPlanColumnWidthStyle(10)}
                            >
                                {truncateCellContent(stage.machine ?? "—", stage.machine ?? undefined)}
                            </TableCell>
                            <TableCell
                                className={dateBodyCellClassName}
                                style={productionPlanColumnWidthStyle(11)}
                            >
                                {stage.startAt ?? "—"}
                            </TableCell>
                            <TableCell
                                className={endDateBodyCellClassName}
                                style={productionPlanColumnWidthStyle(12)}
                            >
                                {stage.endAt ?? "—"}
                            </TableCell>
                        </TableRow>
                    ))}
                    {stages.length === 0 && (
                        <TableRow>
                            <TableCell
                                className={cn(
                                    tableBodyCellClassName,
                                    "py-8 text-center text-muted-foreground",
                                )}
                                colSpan={COLUMN_COUNT}
                            >
                                Ничего не найдено
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </DataTableViewport>
    );
});
