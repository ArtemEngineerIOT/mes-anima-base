import { Fragment } from "react";

import type {
    MaterialsPresenceDeliveryKind,
    MaterialsPresenceRow,
    MaterialsPresenceSlot,
} from "@/features/operator/order-execution/model/materials-writeoff/types";
import { Button } from "@/shared/ui/kit/button";
import { DataTablePanel } from "@/shared/ui/kit/data-table-panel";
import { Icon } from "@/shared/ui/kit/icon";
import { InformerPill } from "@/shared/ui/kit/informer-pill";
import { cn } from "@/shared/lib/css";
import {
    dataTableBodyCellClassName,
    dataTablePanelHeadCellClassName,
    dataTablePanelTableClassName,
    dataTableShellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

type MaterialsWriteoffPresenceTableProps = {
    slots: MaterialsPresenceSlot[];
    isLoading?: boolean;
    presenceAsOf?: string | null;
    expandedRowId: string | null;
    movingToUnwindRowId?: string | null;
    selectedRowId: string | null;
    onExpandedRowIdChange: (id: string | null) => void;
    onMoveToUnwind: (rowId: string) => void;
    onSelectForWriteoff: (row: MaterialsPresenceRow) => void;
};

function PresenceStatusPill({ status }: { status: MaterialsPresenceRow["status"] }) {
    if (status === "ON_UNWIND") {
        return (
            <InformerPill tone="success" variant="filled">
                На размотке
            </InformerPill>
        );
    }

    return (
        <InformerPill tone="warning" variant="filled">
            Ожидание
        </InformerPill>
    );
}

function deliveryKindLabel(kind: MaterialsPresenceDeliveryKind): string | null {
    if (kind === "RAW_MATERIAL") {
        return "Сырьё";
    }

    if (kind === "SEMI_FINISHED") {
        return "Полуфабрикат";
    }

    return null;
}

const presenceActionButtonClassName = "hover:bg-accent hover:text-accent-foreground";
const presenceHeadCellClassName = dataTablePanelHeadCellClassName;
const PRESENCE_COL_COUNT = 6;

function PresenceRollDetails({ row }: { row: MaterialsPresenceRow }) {
    return (
        <TableRow className="bg-muted/20">
            <TableCell className={dataTableBodyCellClassName} />
            <TableCell colSpan={5} className="p-0">
                <div className="px-4 py-2">
                    <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                        <TableBody>
                            <TableRow>
                                <TableCell
                                    className={cn(dataTableBodyCellClassName, "w-[45%] text-muted-foreground")}
                                >
                                    Единица измерения
                                </TableCell>
                                <TableCell className={dataTableBodyCellClassName}>{row.quantityUom}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>
                                    Метраж, м
                                </TableCell>
                                <TableCell className={dataTableBodyCellClassName}>{row.currentLengthM}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>
                                    Вес, кг
                                </TableCell>
                                <TableCell className={dataTableBodyCellClassName}>{row.currentWeightKg}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </TableCell>
        </TableRow>
    );
}

function PresenceRollRow({
    row,
    isExpanded,
    isSelected,
    movingToUnwindRowId,
    onExpandedRowIdChange,
    onMoveToUnwind,
    onSelectForWriteoff,
}: {
    row: MaterialsPresenceRow;
    isExpanded: boolean;
    isSelected: boolean;
    movingToUnwindRowId: string | null;
    onExpandedRowIdChange: (id: string | null) => void;
    onMoveToUnwind: (rowId: string) => void;
    onSelectForWriteoff: (row: MaterialsPresenceRow) => void;
}) {
    return (
        <Fragment>
            <TableRow className={isSelected ? "bg-primary/5" : undefined}>
                <TableCell className={cn(dataTableBodyCellClassName, "w-9")}>
                    <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-sm hover:bg-accent"
                        onClick={() => onExpandedRowIdChange(isExpanded ? null : row.id)}
                        aria-label={`Раскрыть ${row.nomenclatureName}`}
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
                </TableCell>
                <TableCell
                    className={cn(dataTableBodyCellClassName, "max-w-[220px] truncate")}
                    title={row.nomenclatureName}
                >
                    {row.nomenclatureName}
                </TableCell>
                <TableCell className={dataTableBodyCellClassName}>{row.barcode}</TableCell>
                <TableCell className={dataTableBodyCellClassName}>{row.scannedAt}</TableCell>
                <TableCell className={dataTableBodyCellClassName}>
                    <PresenceStatusPill status={row.status} />
                </TableCell>
                <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                    <div className="flex justify-end">
                        {row.status === "WAITING" && row.canMoveToUnwind ? (
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className={presenceActionButtonClassName}
                                pending={movingToUnwindRowId === row.id}
                                pendingLabel="Перемещение…"
                                disabled={movingToUnwindRowId === row.id}
                                onClick={() => {
                                    void onMoveToUnwind(row.id);
                                }}
                            >
                                На размотку
                            </Button>
                        ) : null}
                        {row.status === "ON_UNWIND" && row.writeOffAllowed ? (
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className={presenceActionButtonClassName}
                                onClick={() => onSelectForWriteoff(row)}
                            >
                                Списать
                            </Button>
                        ) : null}
                    </div>
                </TableCell>
            </TableRow>
            {isExpanded ? <PresenceRollDetails row={row} /> : null}
        </Fragment>
    );
}

function PresenceEmptySlotRow() {
    return (
        <TableRow>
            <TableCell className={dataTableBodyCellClassName} />
            <TableCell className={dataTableBodyCellClassName} />
            <TableCell className={dataTableBodyCellClassName} />
            <TableCell className={dataTableBodyCellClassName} />
            <TableCell className={dataTableBodyCellClassName}>
                <InformerPill tone="system" variant="filled">
                    Пусто
                </InformerPill>
            </TableCell>
            <TableCell className={dataTableBodyCellClassName} />
        </TableRow>
    );
}

export function MaterialsWriteoffPresenceTable({
    slots,
    isLoading = false,
    presenceAsOf = null,
    expandedRowId,
    movingToUnwindRowId = null,
    selectedRowId,
    onExpandedRowIdChange,
    onMoveToUnwind,
    onSelectForWriteoff,
}: MaterialsWriteoffPresenceTableProps) {
    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
                <div className={cnSectionBlockTitle()}>Рулоны в машине</div>
                {isLoading ? (
                    <span className="shrink-0 text-[11px] text-muted-foreground">Загрузка…</span>
                ) : presenceAsOf ? (
                    <span className="shrink-0 text-[11px] text-muted-foreground">Обновлено: {presenceAsOf}</span>
                ) : null}
            </div>

            <DataTablePanel>
                <Table className={cn(dataTablePanelTableClassName, "min-w-[720px]")}>
                    <TableHeader>
                        <TableRow className="hover:!bg-transparent">
                            <TableHead className={cn(presenceHeadCellClassName, "w-9")} />
                            <TableHead className={presenceHeadCellClassName}>Номенклатура</TableHead>
                            <TableHead className={presenceHeadCellClassName}>Серия</TableHead>
                            <TableHead className={presenceHeadCellClassName}>Время сканирования</TableHead>
                            <TableHead className={presenceHeadCellClassName}>Статус</TableHead>
                            <TableHead className={cn(presenceHeadCellClassName, "text-right")}>Действие</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={PRESENCE_COL_COUNT}
                                    className={cn(
                                        dataTableBodyCellClassName,
                                        "py-6 text-center text-muted-foreground",
                                    )}
                                >
                                    Загрузка…
                                </TableCell>
                            </TableRow>
                        ) : slots.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={PRESENCE_COL_COUNT}
                                    className={cn(
                                        dataTableBodyCellClassName,
                                        "py-6 text-center text-muted-foreground",
                                    )}
                                >
                                    Нет слотов размотки
                                </TableCell>
                            </TableRow>
                        ) : (
                            slots.map((slot) => {
                                const kindLabel = deliveryKindLabel(slot.deliveryKind);

                                return (
                                    <Fragment key={slot.id}>
                                        <TableRow className="bg-muted/40 hover:!bg-muted/40">
                                            <TableCell
                                                colSpan={PRESENCE_COL_COUNT}
                                                className={cn(dataTableBodyCellClassName, "py-2")}
                                            >
                                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                                    <span>{slot.unwindLabel}</span>
                                                    {kindLabel ? (
                                                        <InformerPill tone="system">{kindLabel}</InformerPill>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {slot.rows.length === 0 ? (
                                            <PresenceEmptySlotRow />
                                        ) : (
                                            slot.rows.map((row) => (
                                                <PresenceRollRow
                                                    key={row.id}
                                                    row={row}
                                                    isExpanded={expandedRowId === row.id}
                                                    isSelected={selectedRowId === row.id}
                                                    movingToUnwindRowId={movingToUnwindRowId}
                                                    onExpandedRowIdChange={onExpandedRowIdChange}
                                                    onMoveToUnwind={onMoveToUnwind}
                                                    onSelectForWriteoff={onSelectForWriteoff}
                                                />
                                            ))
                                        )}
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
