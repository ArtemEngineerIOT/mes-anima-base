import { Fragment } from "react";

import type { MaterialsPresenceRow } from "@/features/operator/order-execution/model/materials-writeoff/types";
import { Button } from "@/shared/ui/kit/button";
import { Icon } from "@/shared/ui/kit/icon";
import { InformerPill } from "@/shared/ui/kit/informer-pill";
import { cn } from "@/shared/lib/css";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

type MaterialsWriteoffPresenceTableProps = {
    rows: MaterialsPresenceRow[];
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

const presenceActionButtonClassName = "hover:bg-accent hover:text-accent-foreground";

export function MaterialsWriteoffPresenceTable({
    rows,
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
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <div className={cnSectionBlockTitle()}>Рулоны в машине</div>
                {isLoading ? (
                    <span className="shrink-0 text-[11px] text-muted-foreground">Загрузка…</span>
                ) : presenceAsOf ? (
                    <span className="shrink-0 text-[11px] text-muted-foreground">Актуально на {presenceAsOf}</span>
                ) : null}
            </div>
            <div className={dataTableScrollViewportClassName}>
                <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className={cn(dataTableStickyHeadCellClassName, "w-9")} />
                            <TableHead className={dataTableStickyHeadCellClassName}>Номенклатура</TableHead>
                            <TableHead className={dataTableStickyHeadCellClassName}>Серия</TableHead>
                            <TableHead className={dataTableStickyHeadCellClassName}>Время сканирования</TableHead>
                            <TableHead className={dataTableStickyHeadCellClassName}>Статус</TableHead>
                            <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>Действие</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className={cn(dataTableBodyCellClassName, "text-center text-muted-foreground")}
                                >
                                    Загрузка…
                                </TableCell>
                            </TableRow>
                        ) : rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className={cn(dataTableBodyCellClassName, "text-center text-muted-foreground")}
                                >
                                    Нет рулонов в машине
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row) => {
                                const isExpanded = expandedRowId === row.id;
                                const isSelected = selectedRowId === row.id;

                                return (
                                    <Fragment key={row.id}>
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

                                        {isExpanded ? (
                                            <TableRow className="bg-muted/20">
                                                <TableCell className={dataTableBodyCellClassName} />
                                                <TableCell colSpan={5} className="p-0">
                                                    <div className="px-4 py-2">
                                                        <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                                                            <TableBody>
                                                                <TableRow>
                                                                    <TableCell
                                                                        className={cn(
                                                                            dataTableBodyCellClassName,
                                                                            "w-[45%] text-muted-foreground",
                                                                        )}
                                                                    >
                                                                        Единица измерения
                                                                    </TableCell>
                                                                    <TableCell className={dataTableBodyCellClassName}>
                                                                        {row.quantityUom}
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell
                                                                        className={cn(
                                                                            dataTableBodyCellClassName,
                                                                            "text-muted-foreground",
                                                                        )}
                                                                    >
                                                                        Метраж, м
                                                                    </TableCell>
                                                                    <TableCell className={dataTableBodyCellClassName}>
                                                                        {row.currentLengthM}
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell
                                                                        className={cn(
                                                                            dataTableBodyCellClassName,
                                                                            "text-muted-foreground",
                                                                        )}
                                                                    >
                                                                        Вес, кг
                                                                    </TableCell>
                                                                    <TableCell className={dataTableBodyCellClassName}>
                                                                        {row.currentWeightKg}
                                                                    </TableCell>
                                                                </TableRow>
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
            </div>
        </div>
    );
}
