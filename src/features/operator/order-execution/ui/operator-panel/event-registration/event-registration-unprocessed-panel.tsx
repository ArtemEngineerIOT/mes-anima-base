import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { Label } from "@/shared/ui/kit/label";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import {
    dataTableBodyCellClassName,
    dataTableHeadCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

import type { useEventRegistration } from "../../../model/event-registration/use-event-registration";

type Registration = ReturnType<typeof useEventRegistration>;

const textareaClass =
    "placeholder:text-muted-foreground min-h-[72px] w-full resize-y rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const selectionColumnClassName = "w-10";

export function EventRegistrationUnprocessedPanel({ registration }: { registration: Registration }) {
    const {
        unprocessed,
        selectedUnprocessedId,
        discardSelectedIds,
        deleteComment,
        toggleDiscardSelection,
        selectSignalForRegistration,
        deleteSelectedSignals,
        setDeleteComment,
        canDeleteSelectedSignals,
    } = registration;

    return (
        <div className="grid gap-3">
            <div className={cnSectionBlockTitle()}>Необработанные сигналы машины</div>

            <div className={dataTableScrollViewportClassName}>
                <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                    <TableHeader className="bg-muted/40">
                        <TableRow className="hover:!bg-transparent">
                            <TableHead
                                className={cn(dataTableHeadCellClassName, selectionColumnClassName)}
                                aria-label="Выбор для удаления"
                            />
                            <TableHead className={dataTableHeadCellClassName}>Имя</TableHead>
                            <TableHead className={dataTableHeadCellClassName}>Начало</TableHead>
                            <TableHead className={dataTableHeadCellClassName}>Завершение</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {unprocessed.map((row) => {
                            const selectedForRegistration = selectedUnprocessedId === row.id;
                            const selectedForDiscard = discardSelectedIds.includes(row.id);

                            return (
                                <TableRow
                                    key={row.id}
                                    className={cn(selectedForRegistration && "bg-muted/50")}
                                >
                                    <TableCell className={cn(dataTableBodyCellClassName, selectionColumnClassName)}>
                                        <input
                                            type="checkbox"
                                            checked={selectedForDiscard}
                                            onChange={() => toggleDiscardSelection(row.id)}
                                            aria-label={`Выбрать сигнал ${row.description} для удаления`}
                                            className="size-4 rounded border-input"
                                        />
                                    </TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>
                                        <button
                                            type="button"
                                            onClick={() => selectSignalForRegistration(row)}
                                            className={cn(
                                                "text-left hover:underline",
                                                selectedForRegistration && "font-medium text-primary",
                                            )}
                                        >
                                            {row.description}
                                        </button>
                                    </TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{row.detectedAt}</TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{row.endedAt}</TableCell>
                                </TableRow>
                            );
                        })}
                        {unprocessed.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className={cn(dataTableBodyCellClassName, "py-4 text-center text-muted-foreground")}
                                >
                                    Нет необработанных сигналов
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="event-discard-comment" className={comboboxFieldLabelClassName}>
                    Комментарий
                </Label>
                <div className="relative">
                    <textarea
                        id="event-discard-comment"
                        value={deleteComment}
                        onChange={(e) => setDeleteComment(e.target.value)}
                        placeholder="Укажите причину удаления выбранных сигналов"
                        rows={3}
                        className={textareaClass}
                    />
                    <div className="mt-2 flex justify-end">
                        <Button
                            type="button"
                            size="sm"
                            disabled={!canDeleteSelectedSignals}
                            onClick={deleteSelectedSignals}
                        >
                            Удалить
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
