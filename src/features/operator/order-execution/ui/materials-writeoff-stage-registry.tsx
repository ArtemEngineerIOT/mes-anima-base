import { Fragment } from "react";

import type { MaterialsStageOperation } from "@/features/operator/order-execution/model/materials-writeoff/types";
import type { MaterialsWriteoffFormState } from "@/features/operator/order-execution/model/materials-writeoff/materials-writeoff-form";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Icon } from "@/shared/ui/kit/icon";
import { cn } from "@/shared/lib/css";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

type MaterialsWriteoffStageRegistryProps = {
    showWriteoffForm?: boolean;
    selectedNomenclature?: string | null;
    writeoffForm: MaterialsWriteoffFormState;
    warehouseOptions: string[];
    isWriteoffWeightLoading?: boolean;
    writeoffWeightError?: string | null;
    canCalculateWeight?: boolean;
    isWriteoffActionsEnabled?: boolean;
    isReflectReturnEnabled?: boolean;
    isFullWriteoffEnabled?: boolean;
    isReflectingReturn?: boolean;
    isWritingOffFully?: boolean;
    reflectReturnError?: string | null;
    writeOffFullyError?: string | null;
    onCalculateWriteoffWeight: () => void;
    onReflectMaterialReturn: () => void;
    onWriteOffMaterialFully: () => void;
    stageOperations: MaterialsStageOperation[];
    isStageRegistryLoading?: boolean;
    stageRegistryError?: string | null;
    stageRegistryAsOf?: string | null;
    printError?: string | null;
    printingMaterialRollId?: string | null;
    expandedOpId: string | null;
    onWriteoffFormChange: (patch: Partial<MaterialsWriteoffFormState>) => void;
    onExpandedOpIdChange: (id: string | null) => void;
    onPrintReturnLabel: (materialRollId: string) => void;
};

export function MaterialsWriteoffStageRegistry({
    showWriteoffForm = true,
    selectedNomenclature = null,
    writeoffForm,
    warehouseOptions,
    isWriteoffWeightLoading = false,
    writeoffWeightError = null,
    canCalculateWeight = false,
    isWriteoffActionsEnabled = false,
    isReflectReturnEnabled = false,
    isFullWriteoffEnabled = false,
    isReflectingReturn = false,
    isWritingOffFully = false,
    reflectReturnError = null,
    writeOffFullyError = null,
    onCalculateWriteoffWeight,
    onReflectMaterialReturn,
    onWriteOffMaterialFully,
    stageOperations,
    isStageRegistryLoading = false,
    stageRegistryError = null,
    stageRegistryAsOf = null,
    printError = null,
    printingMaterialRollId = null,
    expandedOpId,
    onWriteoffFormChange,
    onExpandedOpIdChange,
    onPrintReturnLabel,
}: MaterialsWriteoffStageRegistryProps) {
    return (
        <div className="space-y-3">
            {showWriteoffForm ? (
                <>
                    <div className={cnSectionBlockTitle()}>Данные для списания и последующего возврата</div>
                    <div>
                        <div className={comboboxFieldLabelClassName}>Списываемая номенклатура</div>
                        <Input value={selectedNomenclature ?? "—"} readOnly disabled className="mt-1" />
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-end">
                        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                            <div>
                                <div className={comboboxFieldLabelClassName}>Метраж, м</div>
                                <Input
                                    value={writeoffForm.meters}
                                    inputMode="decimal"
                                    onChange={(e) => onWriteoffFormChange({ meters: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <div className={comboboxFieldLabelClassName}>Вес, кг</div>
                                <Input
                                    value={isWriteoffWeightLoading ? "…" : writeoffForm.weight}
                                    inputMode="decimal"
                                    onChange={(e) => onWriteoffFormChange({ weight: e.target.value })}
                                    className="mt-1"
                                />
                                {writeoffWeightError ? (
                                    <div className="mt-1 text-[11px] text-destructive">{writeoffWeightError}</div>
                                ) : null}
                            </div>
                            <div>
                                <div className={comboboxFieldLabelClassName}>Отправить на склад</div>
                                <select
                                    className="mt-1 h-9 w-full rounded-sm border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                    value={writeoffForm.warehouse}
                                    onChange={(e) => onWriteoffFormChange({ warehouse: e.target.value })}
                                >
                                    <option value="">Выберите склад</option>
                                    {warehouseOptions.map((option) => (
                                        <option key={option} value={option}>
                                            Склад {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            className="shrink-0"
                            disabled={!canCalculateWeight || isWriteoffWeightLoading}
                            onClick={onCalculateWriteoffWeight}
                        >
                            {isWriteoffWeightLoading ? "Расчёт…" : "Рассчитать"}
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        {reflectReturnError ? (
                            <div className="w-full text-right text-[12px] text-destructive">{reflectReturnError}</div>
                        ) : null}
                        {writeOffFullyError ? (
                            <div className="w-full text-right text-[12px] text-destructive">{writeOffFullyError}</div>
                        ) : null}
                        <Button size="sm" disabled={!isReflectReturnEnabled} onClick={onReflectMaterialReturn}>
                            {isReflectingReturn ? "Отражение…" : "Отразить возврат"}
                        </Button>
                        <Button size="sm" disabled={!isFullWriteoffEnabled} onClick={onWriteOffMaterialFully}>
                            {isWritingOffFully ? "Списание…" : "Списать полностью"}
                        </Button>
                        <Button size="sm" disabled={!isWriteoffActionsEnabled}>
                            Отразить списание по этапу
                        </Button>
                    </div>
                </>
            ) : null}

            <div className="space-y-2">
                <div className="flex min-w-0 items-center justify-between gap-3 pb-2">
                    <div className={cnSectionBlockTitle()}>Выполненные операции на этапе</div>
                    {stageRegistryAsOf ? (
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                            Обновлено: {stageRegistryAsOf}
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
        </div>
    );
}
