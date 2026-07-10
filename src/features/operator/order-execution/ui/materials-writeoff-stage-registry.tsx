import { Fragment } from "react";

import type { MaterialsStageOperation } from "@/features/operator/order-execution/model/materials-writeoff/types";
import { Button } from "@/shared/ui/kit/button";
import { Icon } from "@/shared/ui/kit/icon";
import { cn } from "@/shared/lib/css";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

type MaterialsWriteoffStageRegistryProps = {
    stageOperations: MaterialsStageOperation[];
    isStageRegistryLoading?: boolean;
    stageRegistryError?: string | null;
    stageRegistryAsOf?: string | null;
    printError?: string | null;
    printingMaterialRollId?: string | null;
    expandedOpId: string | null;
    onExpandedOpIdChange: (id: string | null) => void;
    onPrintReturnLabel: (materialRollId: string) => void;
};

export function MaterialsWriteoffStageRegistry({
    stageOperations,
    isStageRegistryLoading = false,
    stageRegistryError = null,
    stageRegistryAsOf = null,
    printError = null,
    printingMaterialRollId = null,
    expandedOpId,
    onExpandedOpIdChange,
    onPrintReturnLabel,
}: MaterialsWriteoffStageRegistryProps) {
    return (
        <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 pb-2">
                    <div className={cnSectionBlockTitle()}>Выполненные операции на этапе</div>
                    {isStageRegistryLoading ? (
                        <span className="shrink-0 text-[11px] text-muted-foreground">Загрузка…</span>
                    ) : stageRegistryAsOf ? (
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                            Актуально на {stageRegistryAsOf}
                        </span>
                    ) : null}
                </div>
                {stageRegistryError ? (
                    <div className="text-[12px] text-destructive">{stageRegistryError}</div>
                ) : null}
                {printError ? <div className="text-[12px] text-destructive">{printError}</div> : null}
                <div className={dataTableScrollViewportClassName}>
                    <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "w-9")} />
                                <TableHead className={dataTableStickyHeadCellClassName}>Штрихкод</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Номенклатура</TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>Кол-во 1</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Ед. изм. 1</TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>Кол-во 2</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Ед. изм. 2</TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "w-12 text-right")} />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isStageRegistryLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className={cn(dataTableBodyCellClassName, "text-center text-muted-foreground")}
                                    >
                                        Загрузка…
                                    </TableCell>
                                </TableRow>
                            ) : stageOperations.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className={cn(dataTableBodyCellClassName, "text-center text-muted-foreground")}
                                    >
                                        Нет операций на этапе
                                    </TableCell>
                                </TableRow>
                            ) : (
                                stageOperations.map((op) => {
                                    const isExpanded = expandedOpId === op.id;
                                    return (
                                        <Fragment key={op.id}>
                                            <TableRow>
                                                <TableCell className={cn(dataTableBodyCellClassName, "w-9")}>
                                                    {op.details ? (
                                                        <button
                                                            type="button"
                                                            className="inline-flex h-7 w-7 items-center justify-center rounded-sm hover:bg-accent"
                                                            onClick={() =>
                                                                onExpandedOpIdChange(isExpanded ? null : op.id)
                                                            }
                                                            aria-label="toggle row"
                                                        >
                                                            <Icon
                                                                name="expand_more"
                                                                size="md"
                                                                className={cn(
                                                                    "text-muted-foreground transition-transform",
                                                                    isExpanded ? "rotate-180" : "rotate-0",
                                                                )}
                                                            />
                                                        </button>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>{op.barcode}</TableCell>
                                                <TableCell
                                                    className={cn(dataTableBodyCellClassName, "max-w-[380px] truncate")}
                                                    title={op.nomenclature}
                                                >
                                                    {op.nomenclature}
                                                </TableCell>
                                                <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                                    {op.qty1}
                                                </TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>{op.unit1}</TableCell>
                                                <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                                    {op.qty2}
                                                </TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>{op.unit2}</TableCell>
                                                <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                                    <div className="flex justify-end">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon-sm"
                                                            className="size-7 shrink-0"
                                                            disabled={printingMaterialRollId === op.materialRollId}
                                                            aria-label={`Печать этикетки: ${op.barcode}`}
                                                            onClick={() => onPrintReturnLabel(op.materialRollId)}
                                                        >
                                                            <Icon name="print" size="sm" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {op.details && isExpanded && (
                                                <TableRow className="bg-muted/20">
                                                    <TableCell className={dataTableBodyCellClassName} />
                                                    <TableCell colSpan={7} className="p-0">
                                                        <div className="px-4 py-2">
                                                            <div className={dataTableScrollViewportClassName}>
                                                                <Table
                                                                    className={cn(dataTableShellClassName, "text-[12px]")}
                                                                >
                                                                    <TableHeader className="bg-muted/40">
                                                                        <TableRow>
                                                                            <TableHead
                                                                                className={cn(
                                                                                    dataTableStickyHeadCellClassName,
                                                                                    "w-[45%]",
                                                                                )}
                                                                            >
                                                                                {" "}
                                                                            </TableHead>
                                                                            <TableHead
                                                                                className={cn(
                                                                                    dataTableStickyHeadCellClassName,
                                                                                    "text-right",
                                                                                )}
                                                                            >
                                                                                Кол-во 1
                                                                            </TableHead>
                                                                            <TableHead className={dataTableStickyHeadCellClassName}>
                                                                                Ед. изм. 1
                                                                            </TableHead>
                                                                            <TableHead
                                                                                className={cn(
                                                                                    dataTableStickyHeadCellClassName,
                                                                                    "text-right",
                                                                                )}
                                                                            >
                                                                                Кол-во 2
                                                                            </TableHead>
                                                                            <TableHead className={dataTableStickyHeadCellClassName}>
                                                                                Ед. изм. 2
                                                                            </TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {op.details.map((detail) => (
                                                                            <TableRow key={detail.label}>
                                                                                <TableCell
                                                                                    className={cn(
                                                                                        dataTableBodyCellClassName,
                                                                                        "text-muted-foreground",
                                                                                    )}
                                                                                >
                                                                                    {detail.label}
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    className={cn(
                                                                                        dataTableBodyCellClassName,
                                                                                        "text-right",
                                                                                    )}
                                                                                >
                                                                                    {detail.qty1}
                                                                                </TableCell>
                                                                                <TableCell className={dataTableBodyCellClassName}>
                                                                                    {detail.unit1}
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    className={cn(
                                                                                        dataTableBodyCellClassName,
                                                                                        "text-right",
                                                                                    )}
                                                                                >
                                                                                    {detail.qty2}
                                                                                </TableCell>
                                                                                <TableCell className={dataTableBodyCellClassName}>
                                                                                    {detail.unit2}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Fragment>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
        </div>
    );
}
