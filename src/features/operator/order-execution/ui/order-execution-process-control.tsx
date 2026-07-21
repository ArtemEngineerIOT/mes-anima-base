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

import type { ProcessControlChecklistRow, ProcessControlFormState, ProcessControlInfoBlock } from "../model/process-control/types";

type OrderExecutionProcessControlProps = {
    workAreaId?: string;
    form: ProcessControlFormState;
    setReplacedElementsCount: (value: string) => void;
    setPressWidth: (value: string) => void;
    toggleFlag: (rowId: string) => void;
    setChecklistValue: (rowId: string, value: string) => void;
    checklistRows: ProcessControlChecklistRow[];
    infoBlocks: ProcessControlInfoBlock[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    saveError: string | null;
    save: () => Promise<void>;
};

export function OrderExecutionProcessControl({
    workAreaId,
    form,
    setReplacedElementsCount,
    setPressWidth,
    toggleFlag,
    setChecklistValue,
    checklistRows,
    infoBlocks,
    isLoading,
    isSaving,
    error,
    saveError,
    save,
}: OrderExecutionProcessControlProps) {
    const fieldsDisabled = isLoading || isSaving || !workAreaId?.trim();

    return (
        <div className="flex flex-col gap-4">
            {error ? (
                <Informer tone="alert" variant="filled" title="Ошибка загрузки" description={error} />
            ) : null}

            {saveError ? (
                <Informer tone="alert" variant="filled" title="Ошибка сохранения" description={saveError} />
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:max-w-[320px]">
                <div>
                    <div className={comboboxFieldLabelClassName}>Элементов заменено</div>
                    <Input
                        className="mt-1"
                        value={form.replacedElementsCount}
                        onChange={(event) => setReplacedElementsCount(event.target.value)}
                        inputMode="numeric"
                        disabled={fieldsDisabled}
                    />
                </div>
                <div>
                    <div className={comboboxFieldLabelClassName}>Ширина пресёра</div>
                    <Input
                        className="mt-1"
                        value={form.pressWidth}
                        onChange={(event) => setPressWidth(event.target.value)}
                        inputMode="decimal"
                        disabled={fieldsDisabled}
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
                                    {row.hasValue ? (
                                        <Input
                                            className="mx-auto h-8 max-w-[180px] text-center text-[12px]"
                                            value={form.checklistValues[row.id] ?? ""}
                                            onChange={(event) => setChecklistValue(row.id, event.target.value)}
                                            disabled={fieldsDisabled}
                                            aria-label={row.section}
                                        />
                                    ) : (
                                        <input
                                            type="checkbox"
                                            checked={Boolean(form.flags[row.id])}
                                            onChange={() => toggleFlag(row.id)}
                                            disabled={fieldsDisabled}
                                            className="h-4 w-4 accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label={row.section}
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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

            <div className="flex justify-end">
                <Button
                    size="sm"
                    disabled={fieldsDisabled}
                    pending={isSaving}
                    pendingLabel="Сохранение…"
                    onClick={() => {
                        void save();
                    }}
                >
                    Сохранить
                </Button>
            </div>
        </div>
    );
}
