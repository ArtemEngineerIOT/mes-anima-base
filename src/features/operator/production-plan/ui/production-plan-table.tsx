import { memo } from "react";
import { cn } from "@/shared/lib/css";
import { InformerPill } from "@/shared/ui/kit/informer-pill";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
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

export const ProductionPlanTable = memo(function ProductionPlanTable({
    stages,
    selectedId,
    onSelect,
}: ProductionPlanTableProps) {
    return (
        <div className={dataTableScrollViewportClassName}>
            <Table className={cn(dataTableShellClassName, "border-separate border-spacing-0 text-[12px]")}>
                <TableHeader>
                    <TableRow className="hover:!bg-transparent">
                        <TableHead className={dataTableStickyHeadCellClassName} aria-label="select" />
                        <TableHead className={dataTableStickyHeadCellClassName}>Статус этапа</TableHead>
                        <TableHead className={dataTableStickyHeadCellClassName}>Дата заказа</TableHead>
                        <TableHead className={dataTableStickyHeadCellClassName}>Клиент</TableHead>
                        <TableHead className={dataTableStickyHeadCellClassName}>Номер клиента</TableHead>
                        <TableHead className={dataTableStickyHeadCellClassName}>ID этапа</TableHead>
                        <TableHead className={dataTableStickyHeadCellClassName}>Этап</TableHead>
                        <TableHead className={dataTableStickyHeadCellClassName}>Продукт</TableHead>
                        <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>Количество</TableHead>
                        <TableHead className={dataTableStickyHeadCellClassName}>Ед. измерения</TableHead>
                        <TableHead className={dataTableStickyHeadCellClassName}>Машина</TableHead>
                        <TableHead className={dataTableStickyHeadCellClassName}>Старт</TableHead>
                        <TableHead className={dataTableStickyHeadCellClassName}>Завершение</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stages.map((stage) => (
                        <TableRow
                            key={stage.stageId}
                            className={cn(
                                "cursor-pointer",
                                selectedId === stage.stageId && "bg-accent/40",
                            )}
                            onClick={() => onSelect(stage.stageId)}
                        >
                            <TableCell className={dataTableBodyCellClassName}>
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
                            <TableCell className={dataTableBodyCellClassName}>
                                {stage.clientNumber ?? "—"}
                            </TableCell>
                            <TableCell className={dataTableBodyCellClassName}>{stage.stageId}</TableCell>
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
                                colSpan={13}
                            >
                                Ничего не найдено
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
});
