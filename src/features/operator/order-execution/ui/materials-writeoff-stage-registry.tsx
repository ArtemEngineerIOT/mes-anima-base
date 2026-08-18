import { Fragment } from "react";

import type { MaterialsStageOperation } from "@/features/operator/order-execution/model/materials-writeoff/types";
import { isMaterialsStageReturnOperation } from "@/features/operator/order-execution/model/materials-writeoff/map-materials-stage-operation";
import { useDataTablePagination } from "@/shared/lib/data-table-pagination";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { DataTablePaginationFooter } from "@/shared/ui/kit/data-table-pagination-footer";
import { DataTablePanel } from "@/shared/ui/kit/data-table-panel";
import { Icon } from "@/shared/ui/kit/icon";
import {
    dataTableBodyCellClassName,
    dataTablePanelHeadCellClassName,
    dataTablePanelTableClassName,
    dataTableShellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

type MaterialsWriteoffStageRegistryProps = {
    stageOperations: MaterialsStageOperation[];
    isStageRegistryLoading?: boolean;
    stageRegistryError?: string | null;
    stageRegistryAsOf?: string | null;
    printingMaterialRollId?: string | null;
    expandedOpIds: ReadonlySet<string>;
    onToggleExpandedOpId: (id: string) => void;
    onPrintReturnLabel: (materialRollId: string) => void;
};

const headCellClassName = cn(dataTablePanelHeadCellClassName, "whitespace-nowrap");
const bodyCellClassName = cn(dataTableBodyCellClassName, "whitespace-nowrap");

export function MaterialsWriteoffStageRegistry({
    stageOperations,
    isStageRegistryLoading = false,
    stageRegistryError = null,
    stageRegistryAsOf = null,
    printingMaterialRollId = null,
    expandedOpIds,
    onToggleExpandedOpId,
    onPrintReturnLabel,
}: MaterialsWriteoffStageRegistryProps) {
    const { pageItems, pagination, pageSize, setPageSize, setPage } = useDataTablePagination(
        stageOperations,
        {
            initialPageSize: 5,
        },
    );

    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
                <div className={cnSectionBlockTitle()}>Выполненные операции на этапе</div>
                {isStageRegistryLoading ? (
                    <span className="shrink-0 text-[11px] text-muted-foreground">Загрузка…</span>
                ) : stageRegistryAsOf ? (
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                        Обновлено: {stageRegistryAsOf}
                    </span>
                ) : null}
            </div>
            {stageRegistryError ? (
                <div className="text-[12px] text-destructive">{stageRegistryError}</div>
            ) : null}

            <DataTablePanel
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
                <Table className={dataTablePanelTableClassName}>
                        <TableHeader>
                            <TableRow className="hover:!bg-transparent">
                                <TableHead className={cn(headCellClassName, "w-9")} />
                                <TableHead className={headCellClassName}>Номенклатура</TableHead>
                                <TableHead className={headCellClassName}>Серия</TableHead>
                                <TableHead className={cn(headCellClassName, "text-right")}>Кол-во 1</TableHead>
                                <TableHead className={headCellClassName}>Ед. изм. 1</TableHead>
                                <TableHead className={cn(headCellClassName, "text-right")}>Кол-во 2</TableHead>
                                <TableHead className={headCellClassName}>Ед. изм. 2</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isStageRegistryLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className={cn(
                                            dataTableBodyCellClassName,
                                            "py-6 text-center text-muted-foreground",
                                        )}
                                    >
                                        Загрузка…
                                    </TableCell>
                                </TableRow>
                            ) : pageItems.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className={cn(
                                            dataTableBodyCellClassName,
                                            "py-6 text-center text-muted-foreground",
                                        )}
                                    >
                                        Нет операций на этапе
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pageItems.map((op) => {
                                    const isExpanded = expandedOpIds.has(op.id);
                                    return (
                                        <Fragment key={op.id}>
                                            <TableRow>
                                                <TableCell className={cn(bodyCellClassName, "w-9")}>
                                                    {op.details ? (
                                                        <button
                                                            type="button"
                                                            className="inline-flex h-7 w-7 items-center justify-center rounded-sm hover:bg-accent"
                                                            onClick={() => onToggleExpandedOpId(op.id)}
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
                                                <TableCell className={bodyCellClassName} title={op.nomenclature}>
                                                    {op.nomenclature}
                                                </TableCell>
                                                <TableCell className={bodyCellClassName}>{op.barcode}</TableCell>
                                                <TableCell className={cn(bodyCellClassName, "text-right")}>
                                                    {op.qty1}
                                                </TableCell>
                                                <TableCell className={bodyCellClassName}>{op.unit1}</TableCell>
                                                <TableCell className={cn(bodyCellClassName, "text-right")}>
                                                    {op.qty2}
                                                </TableCell>
                                                <TableCell className={bodyCellClassName}>{op.unit2}</TableCell>
                                            </TableRow>

                                            {op.details && isExpanded ? (
                                                <TableRow className="bg-muted/20">
                                                    <TableCell className={dataTableBodyCellClassName} />
                                                    <TableCell colSpan={6} className="p-0">
                                                        <div className="px-4 py-2">
                                                            <Table
                                                                className={cn(dataTableShellClassName, "text-[12px]")}
                                                            >
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead
                                                                            className={cn(
                                                                                headCellClassName,
                                                                                "w-[45%]",
                                                                            )}
                                                                        >
                                                                            Параметр
                                                                        </TableHead>
                                                                        <TableHead
                                                                            className={cn(
                                                                                headCellClassName,
                                                                                "text-right",
                                                                            )}
                                                                        >
                                                                            Кол-во 1
                                                                        </TableHead>
                                                                        <TableHead
                                                                            className={headCellClassName}
                                                                        >
                                                                            Ед. изм. 1
                                                                        </TableHead>
                                                                        <TableHead
                                                                            className={cn(
                                                                                headCellClassName,
                                                                                "text-right",
                                                                            )}
                                                                        >
                                                                            Кол-во 2
                                                                        </TableHead>
                                                                        <TableHead
                                                                            className={headCellClassName}
                                                                        >
                                                                            Ед. изм. 2
                                                                        </TableHead>
                                                                        <TableHead
                                                                            className={cn(
                                                                                headCellClassName,
                                                                                "w-12 text-right",
                                                                            )}
                                                                        >
                                                                            Действие
                                                                        </TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {op.details.map((detail, detailIndex) => {
                                                                        const isReturnOperation =
                                                                            isMaterialsStageReturnOperation(detail);

                                                                        return (
                                                                        <TableRow key={`${detail.label}-${detailIndex}`}>
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
                                                                                    "whitespace-nowrap text-right",
                                                                                )}
                                                                            >
                                                                                {detail.qty1}
                                                                            </TableCell>
                                                                            <TableCell
                                                                                className={cn(
                                                                                    dataTableBodyCellClassName,
                                                                                    "whitespace-nowrap",
                                                                                )}
                                                                            >
                                                                                {detail.unit1}
                                                                            </TableCell>
                                                                            <TableCell
                                                                                className={cn(
                                                                                    dataTableBodyCellClassName,
                                                                                    "whitespace-nowrap text-right",
                                                                                )}
                                                                            >
                                                                                {detail.qty2}
                                                                            </TableCell>
                                                                            <TableCell
                                                                                className={cn(
                                                                                    dataTableBodyCellClassName,
                                                                                    "whitespace-nowrap",
                                                                                )}
                                                                            >
                                                                                {detail.unit2}
                                                                            </TableCell>
                                                                            <TableCell
                                                                                className={cn(
                                                                                    dataTableBodyCellClassName,
                                                                                    "w-12 text-right",
                                                                                )}
                                                                            >
                                                                                {isReturnOperation ? (
                                                                                    <div className="flex justify-end">
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="outline"
                                                                                            size="icon-sm"
                                                                                            className="size-7 shrink-0"
                                                                                            disabled={
                                                                                                printingMaterialRollId ===
                                                                                                op.materialRollId
                                                                                            }
                                                                                            aria-label={`Печать этикетки возврата: ${op.barcode}`}
                                                                                            onClick={() =>
                                                                                                onPrintReturnLabel(
                                                                                                    op.materialRollId,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Icon name="print" size="sm" />
                                                                                        </Button>
                                                                                    </div>
                                                                                ) : null}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        );
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : null}
                                        </Fragment>
                                    );
                                })
                            )}
                        </TableBody>
                </Table>
            </DataTablePanel>
        </div>
    );
}
