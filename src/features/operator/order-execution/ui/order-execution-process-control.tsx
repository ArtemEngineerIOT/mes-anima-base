import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Informer } from "@/shared/ui/kit/informer";
import { cn } from "@/shared/lib/css";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import { useProcessControl } from "../model/process-control/use-process-control";

export function OrderExecutionProcessControl() {
    const {
        form,
        setReplacedElementsCount,
        setPressWidth,
        toggleFlag,
        checklistRows,
        infoBlocks,
    } = useProcessControl();

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:max-w-[320px]">
                <div>
                    <div className={comboboxFieldLabelClassName}>Элементов заменено</div>
                    <Input
                        className="mt-1"
                        value={form.replacedElementsCount}
                        onChange={(event) => setReplacedElementsCount(event.target.value)}
                    />
                </div>
                <div>
                    <div className={comboboxFieldLabelClassName}>Ширина пресёра</div>
                    <Input
                        className="mt-1"
                        value={form.pressWidth}
                        onChange={(event) => setPressWidth(event.target.value)}
                    />
                </div>
            </div>

            <div className={dataTableScrollViewportClassName}>
                <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className={dataTableStickyHeadCellClassName}>Участок</TableHead>
                            <TableHead className={cn(dataTableStickyHeadCellClassName, "w-[220px] text-center")}>
                                Признак
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {checklistRows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell className={dataTableBodyCellClassName}>{row.section}</TableCell>
                                <TableCell className={cn(dataTableBodyCellClassName, "text-center")}>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(form.flags[row.id])}
                                        onChange={() => toggleFlag(row.id)}
                                        className="h-4 w-4 accent-primary"
                                        aria-label={row.section}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-end">
                <Button size="sm">Сохранить</Button>
            </div>

            {infoBlocks.map((block) => (
                <Informer
                    key={block.id}
                    tone="normal"
                    variant="filled"
                    iconName="info"
                    title={block.title}
                    description={block.description}
                />
            ))}
        </div>
    );
}
