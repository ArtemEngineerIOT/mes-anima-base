import { cn } from "@/shared/lib/css";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import type { DefectWeighingModel } from "../model/use-defect-weighing";

type DefectWeighingJournalPanelProps = {
    model: DefectWeighingModel;
};

export function DefectWeighingJournalPanel({ model }: DefectWeighingJournalPanelProps) {
    const { journal } = model;

    return (
        <div className="flex min-h-0 flex-col gap-2">
            <div className={cnSectionBlockTitle()}>Журнал взвешиваний на весах</div>
            <div className={dataTableScrollViewportClassName}>
                <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className={dataTableStickyHeadCellClassName}>Этап</TableHead>
                            <TableHead className={dataTableStickyHeadCellClassName}>Регистрация</TableHead>
                            <TableHead className={cn(dataTableStickyHeadCellClassName, "text-right")}>Вес, кг</TableHead>
                            <TableHead className={dataTableStickyHeadCellClassName}>Дефект</TableHead>
                            <TableHead className={dataTableStickyHeadCellClassName}>Примечание</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {journal.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className={cn(dataTableBodyCellClassName, "text-center text-muted-foreground")}
                                >
                                    Записей пока нет
                                </TableCell>
                            </TableRow>
                        ) : (
                            journal.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className={dataTableBodyCellClassName}>{row.stageLabel}</TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{row.registeredAt}</TableCell>
                                    <TableCell className={cn(dataTableBodyCellClassName, "text-right tabular-nums")}>
                                        {row.weightKg}
                                    </TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{row.defectLabel}</TableCell>
                                    <TableCell
                                        className={cn(dataTableBodyCellClassName, "max-w-[180px] truncate")}
                                        title={row.note}
                                    >
                                        {row.note || "—"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
