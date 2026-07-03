import { Button } from "@/shared/ui/kit/button";
import { Card, CardContent } from "@/shared/ui/kit/card";
import { Informer } from "@/shared/ui/kit/informer";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cn } from "@/shared/lib/css";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { sectionBlockTitleClassName } from "@/shared/ui/kit/styles/section-block-title";

import type { MaterialMoveModel } from "../model/use-material-move";

type MaterialMoveWorkspaceProps = {
    model: MaterialMoveModel;
};

export function MaterialMoveWorkspace({ model }: MaterialMoveWorkspaceProps) {
    const {
        rows,
        selectedIds,
        toggleRow,
        setRowQty,
        showSourceAvailabilityWarning,
        byTime,
        setByTime,
        warehouseComment,
        setWarehouseComment,
        resetForm,
        submitRequest,
    } = model;

    return (
        <Card className="min-h-0 flex flex-1 flex-col gap-0 py-0">
            <CardContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0">
                <div className="border-b border-border px-4 py-3">
                    <div className={sectionBlockTitleClassName}>Материалы на складе источнике</div>
                </div>
                <div className="app-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4 py-4">
                    {showSourceAvailabilityWarning ? (
                        <Informer
                            tone="warning"
                            variant="filled"
                            size="s"
                            title="Внимание"
                            description="По последнему заказу для позиции SR00051 доступно только 357 ед. Заказ не создан. В таблице ниже перечислены доступные материалы."
                        />
                    ) : null}

                    <div className={dataTableScrollViewportClassName}>
                        <Table className={cn(dataTableShellClassName, "min-w-[720px]", "text-[12px]")}>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-10")} aria-label="Выбор" />
                                    <TableHead className={dataTableStickyHeadCellClassName}>Номенклатура</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-20")}>Назначение</TableHead>
                                    <TableHead className={dataTableStickyHeadCellClassName}>Серия</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-40")}>Запрошенное количество</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className={dataTableBodyCellClassName}>
                                            <input
                                                type="checkbox"
                                                className="border-input size-4 rounded border"
                                                checked={selectedIds.has(row.id)}
                                                onChange={() => toggleRow(row.id)}
                                                aria-label={`Выбрать ${row.nomenclature}`}
                                            />
                                        </TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.nomenclature}</TableCell>
                                        <TableCell className={cn(dataTableBodyCellClassName, "text-center")}>{row.purpose}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.series}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>
                                            <Input
                                                type="number"
                                                min={0}
                                                className="h-8 max-w-[140px] text-right tabular-nums"
                                                value={Number.isFinite(row.requestedQty) ? row.requestedQty : 0}
                                                onChange={(e) =>
                                                    setRowQty(row.id, Math.max(0, Number(e.target.value) || 0))
                                                }
                                                aria-label={`Количество для ${row.nomenclature}`}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-auto flex flex-col gap-4 border-t border-border pt-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="grid max-w-xl flex-1 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="material-move-by-time">Ко времени</Label>
                                <Input
                                    id="material-move-by-time"
                                    type="datetime-local"
                                    value={byTime}
                                    onChange={(e) => setByTime(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="material-move-comment">Комментарий для склада</Label>
                                <textarea
                                    id="material-move-comment"
                                    rows={4}
                                    placeholder="Заполните при необходимости"
                                    value={warehouseComment}
                                    onChange={(e) => setWarehouseComment(e.target.value)}
                                    className={cn(
                                        "border-input bg-background placeholder:text-muted-foreground min-h-[88px] w-full resize-y rounded-sm border px-3 py-2 text-sm shadow-xs outline-none",
                                        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap justify-end gap-2 lg:pb-1">
                            <Button type="button" size="sm" onClick={submitRequest}>
                                Отправить заявку
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={resetForm}>
                                Очистить заявку
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
