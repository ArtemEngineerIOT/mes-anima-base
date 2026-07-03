import type { ReactNode } from "react";

import { cn } from "@/shared/lib/css";
import { InformerPill, type InformerPillVariant } from "@/shared/ui/kit/informer-pill";
import { InformerTablePanel } from "@/shared/ui/kit/informer-table-panel";
import type { InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellOnBackgroundClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

export type MachineDataPanelRowValueDisplay = {
    pill: true;
    tone: InformerTone;
    variant?: InformerPillVariant;
    /** Цвет левой полосы `InformerTablePanel` берётся из этой строки */
    drivesPanelTone?: boolean;
};

export type MachineDataPanelRow = {
    characteristic: string;
    value: ReactNode;
    unit: string;
    valueDisplay?: MachineDataPanelRowValueDisplay;
};

export type MachineDataPanelProps = {
    rows: MachineDataPanelRow[];
    updatedAt?: string | null;
    tone?: InformerTone;
    iconName?: string;
    title?: ReactNode;
    emptyText?: string;
    className?: string;
};

const DEFAULT_TITLE = "Данные с машины";

function resolvePanelTone(rows: MachineDataPanelRow[], fallback: InformerTone): InformerTone {
    const driverRow = rows.find((row) => row.valueDisplay?.drivesPanelTone);
    return driverRow?.valueDisplay?.tone ?? fallback;
}

export function MachineDataPanel({
    rows,
    updatedAt,
    tone = "success",
    iconName,
    title = DEFAULT_TITLE,
    emptyText = "Нет данных с машины",
    className,
}: MachineDataPanelProps) {
    const panelTone = resolvePanelTone(rows, tone);
    const panelIconName = iconName ?? (panelTone === "success" ? "settings" : undefined);
    const titleContent = updatedAt ? (
        <div className="flex min-w-0 items-center justify-between gap-3">
            <span className="min-w-0 truncate">{title}</span>
            <span className="shrink-0 text-[11px] font-normal text-muted-foreground">Обновлено: {updatedAt}</span>
        </div>
    ) : (
        title
    );

    return (
        <InformerTablePanel tone={panelTone} title={titleContent} iconName={panelIconName} className={className}>
            <div className={dataTableScrollViewportClassName}>
                <Table className={cn(dataTableShellClassName, "border-0")}>
                    <TableHeader className="bg-muted/40 [&_tr]:border-0">
                        <TableRow className="border-0">
                            <TableHead className={cn(dataTableStickyHeadCellOnBackgroundClassName, "w-[45%]")}>
                                Характеристика
                            </TableHead>
                            <TableHead className={dataTableStickyHeadCellOnBackgroundClassName}>Значение</TableHead>
                            <TableHead className={cn(dataTableStickyHeadCellOnBackgroundClassName, "text-right")}>
                                Ед. изм.
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className={cn(
                                        dataTableBodyCellClassName,
                                        "py-6 text-center text-muted-foreground",
                                    )}
                                >
                                    {emptyText}
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row) => (
                                <TableRow key={row.characteristic}>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>
                                        {row.characteristic}
                                    </TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>
                                        {row.valueDisplay?.pill ? (
                                            <InformerPill
                                                tone={row.valueDisplay.tone}
                                                variant={row.valueDisplay.variant ?? "filled"}
                                            >
                                                {row.value}
                                            </InformerPill>
                                        ) : (
                                            row.value
                                        )}
                                    </TableCell>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                        {row.unit}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </InformerTablePanel>
    );
}
