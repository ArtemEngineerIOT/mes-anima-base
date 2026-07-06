import { memo } from "react";
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

import type { ProductionStage } from "../model/types";
import {
    stageStatusInformerTone,
    stageStatusInformerVariant,
    statusLabel,
} from "../model/stage-status";

type ProductionPlanTableProps = {
    stages: ProductionStage[];
    selectedId: string | null;
    onSelect: (stageId: string | null) => void;
};

const COLUMN_COUNT = 13;
const selectionColumnClassName = "w-10";
/** Минимальная ширина по контенту при `table-layout: fixed` (split-scroll). */
const contentWidthColumnClassName = "w-[1%] whitespace-nowrap";

export const ProductionPlanTable = memo(function ProductionPlanTable({
    stages,
    selectedId,
    onSelect,
}: ProductionPlanTableProps) {
    const { pageItems, pagination, pageSize, setPageSize, setPage } = useDataTablePagination(stages);

    return (
        <DataTableViewport
            layout="fill"
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
            <Table className={cn(dataTableInsetShellClassName, "border-separate border-spacing-0 text-[12px]")}>
                <TableHeader>
                    <TableRow className="hover:!bg-transparent">
                        <TableHead
                            className={cn(dataTableHeadCellClassName, "bg-muted/40", selectionColumnClassName)}
                            aria-label="select"
                        />
                        <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Статус этапа</TableHead>
                        <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Дата заказа</TableHead>
                        <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Клиент</TableHead>
                        <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Номер клиента</TableHead>
                        <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>ID этапа</TableHead>
                        <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Этап</TableHead>
                        <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Продукт</TableHead>
                        <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40 text-right")}>Количество</TableHead>
                        <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Ед. измерения</TableHead>
                        <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Машина</TableHead>
                        <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Старт</TableHead>
                        <TableHead className={cn(dataTableHeadCellClassName, "bg-muted/40")}>Завершение</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className={dataTableSplitScrollBodyClassName}>
                    {pageItems.map((stage) => (
                        <TableRow
                            key={stage.stageId}
                            className={cn(
                                "cursor-pointer",
                                selectedId === stage.stageId && "bg-accent/40",
                            )}
                            onClick={() => onSelect(stage.stageId)}
                        >
                            <TableCell className={cn(dataTableBodyCellClassName, selectionColumnClassName)}>
                                <input
                                    type="checkbox"
                                    checked={selectedId === stage.stageId}
                                    onChange={(event) =>
                                        onSelect(event.target.checked ? stage.stageId : null)
                                    }
                                    onClick={(event) => event.stopPropagation()}
                                />
                            </TableCell>
                            <TableCell className={dataTableBodyCellClassName}>
                                <InformerPill
                                    tone={stageStatusInformerTone(stage.status)}
                                    variant={stageStatusInformerVariant(stage.status)}
                                >
                                    {stage.statusDisplayLabel ?? statusLabel(stage.status)}
                                </InformerPill>
                                {stage.hasPrevUnfinished && (
                                    <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-200">
                                        Есть невыполненные этапы перед ним
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className={dataTableBodyCellClassName}>
                                {stage.orderDate ?? "—"}
                            </TableCell>
                            <TableCell className={dataTableBodyCellClassName}>{stage.client ?? "—"}</TableCell>
                            <TableCell className={cn(dataTableBodyCellClassName)}>{stage.clientNumber ?? "—"}</TableCell>
                            <TableCell className={cn(dataTableBodyCellClassName)}>{stage.stageId}</TableCell>
                            <TableCell className={dataTableBodyCellClassName}>{stage.stageName}</TableCell>
                            <TableCell
                                className={cn(dataTableBodyCellClassName, "max-w-[340px] truncate")}
                                title={stage.product}
                            >
                                {stage.product ?? "—"}
                            </TableCell>
                            <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                {stage.quantity?.toLocaleString("ru-RU") ?? "—"}
                            </TableCell>
                            <TableCell className={dataTableBodyCellClassName}>{stage.unit ?? "—"}</TableCell>
                            <TableCell className={dataTableBodyCellClassName}>{stage.machine ?? "—"}</TableCell>
                            <TableCell className={dataTableBodyCellClassName}>{stage.startAt ?? "—"}</TableCell>
                            <TableCell className={dataTableBodyCellClassName}>{stage.endAt ?? "—"}</TableCell>
                        </TableRow>
                    ))}
                    {stages.length === 0 && (
                        <TableRow>
                            <TableCell
                                className={cn(
                                    dataTableBodyCellClassName,
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
