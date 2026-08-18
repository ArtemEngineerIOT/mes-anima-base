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
    /** Подпись перед `updatedAt`. По умолчанию «Обновлено». */
    updatedAtLabel?: string;
    tone?: InformerTone;
    iconName?: string;
    title?: ReactNode;
    emptyText?: string;
    className?: string;
    /** Левая цветовая полоса `InformerTablePanel`. По умолчанию `true`. */
    showToneBar?: boolean;
    /** Футер под таблицей (кнопки действий и т. п.) */
    footer?: ReactNode;
    /** Показывать колонку «Ед. изм.». По умолчанию `true`. */
    showUnitColumn?: boolean;
};

const DEFAULT_TITLE = "Данные с машины";

function resolvePanelTone(rows: MachineDataPanelRow[], fallback: InformerTone): InformerTone {
    const driverRow = rows.find((row) => row.valueDisplay?.drivesPanelTone);
    return driverRow?.valueDisplay?.tone ?? fallback;
}

export function MachineDataPanel({
    rows,
    updatedAt,
    updatedAtLabel = "Обновлено",
    tone = "success",
    iconName,
    title = DEFAULT_TITLE,
    emptyText = "Нет данных с машины",
    className,
    showToneBar = true,
    footer,
    showUnitColumn = true,
}: MachineDataPanelProps) {
    const panelTone = resolvePanelTone(rows, tone);
    const panelIconName = iconName ?? (panelTone === "success" ? "settings" : undefined);
    const titleEnd =
        updatedAt != null && String(updatedAt).trim()
            ? `${updatedAtLabel}: ${String(updatedAt).trim()}`
            : undefined;

    return (
        <InformerTablePanel
            tone={panelTone}
            title={title}
            titleEnd={titleEnd}
            iconName={panelIconName}
            showToneBar={showToneBar}
            footer={footer}
            className={className}
        >
            <div className={dataTableScrollViewportClassName}>
                <Table className={cn(dataTableShellClassName, "border-0")}>
                    <TableHeader className="bg-muted/40 [&_tr]:border-0">
                        <TableRow className="border-0">
                            <TableHead className={cn(dataTableStickyHeadCellOnBackgroundClassName, "w-[45%]")}>
                                Характеристика
                            </TableHead>
                            <TableHead className={dataTableStickyHeadCellOnBackgroundClassName}>Значение</TableHead>
                            {showUnitColumn ? (
                                <TableHead className={cn(dataTableStickyHeadCellOnBackgroundClassName, "text-right")}>
                                    Ед. изм.
                                </TableHead>
                            ) : null}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={showUnitColumn ? 3 : 2}
                                    className={cn(
                                        dataTableBodyCellClassName,
                                        "py-6 text-center text-muted-foreground",
                                    )}
                                >
                                    {emptyText}
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row) => {
                                const keepOnOneLine = Boolean(row.valueDisplay?.pill);
                                return (
                                    <TableRow key={row.characteristic}>
                                        <TableCell
                                            className={cn(
                                                dataTableBodyCellClassName,
                                                "text-muted-foreground",
                                                keepOnOneLine && "whitespace-nowrap",
                                            )}
                                        >
                                            {row.characteristic}
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                dataTableBodyCellClassName,
                                                keepOnOneLine && "whitespace-nowrap",
                                            )}
                                        >
                                            {row.valueDisplay?.pill ? (
                                                <InformerPill
                                                    className="whitespace-nowrap"
                                                    tone={row.valueDisplay.tone}
                                                    variant={row.valueDisplay.variant ?? "filled"}
                                                >
                                                    {row.value}
                                                </InformerPill>
                                            ) : (
                                                row.value
                                            )}
                                        </TableCell>
                                        {showUnitColumn ? (
                                            <TableCell className={cn(dataTableBodyCellClassName, "text-right")}>
                                                {row.unit}
                                            </TableCell>
                                        ) : null}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </InformerTablePanel>
    );
}
