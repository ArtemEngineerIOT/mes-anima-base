import type { ReactNode } from "react";
import { cn } from "@/shared/lib/css";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

export function OrderExecutionSimpleTable({
    columns,
    rows,
    emptyText = "Нет данных",
}: {
    columns: { key: string; label: string; align?: "left" | "center" | "right"; headerClassName?: string }[];
    rows: Record<string, ReactNode>[];
    emptyText?: string;
}) {
    return (
        <div className={dataTableScrollViewportClassName}>
            <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                <TableHeader className="bg-muted/40">
                    <TableRow>
                        {columns.map((c) => (
                            <TableHead
                                key={c.key}
                                className={cn(
                                    dataTableStickyHeadCellClassName,
                                    c.align === "right" && "text-right",
                                    c.align === "center" && "text-center",
                                    c.headerClassName,
                                )}
                            >
                                {c.label}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((r, idx) => (
                        <TableRow key={idx}>
                            {columns.map((c) => (
                                <TableCell
                                    key={c.key}
                                    className={cn(
                                        dataTableBodyCellClassName,
                                        c.align === "right" && "text-right",
                                        c.align === "center" && "text-center",
                                    )}
                                >
                                    {r[c.key] ?? "—"}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                    {rows.length === 0 && (
                        <TableRow>
                            <TableCell
                                className={cn(
                                    dataTableBodyCellClassName,
                                    "py-6 text-center text-muted-foreground",
                                )}
                                colSpan={columns.length}
                            >
                                {emptyText}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
