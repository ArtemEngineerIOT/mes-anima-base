import { useEffect, useMemo, useState } from "react";

import {
    MOCK_AREAS,
    MOCK_CURRENT_ORDER,
    MOCK_CURRENT_SHIFT,
    MOCK_EMPLOYEES,
    MOCK_MACHINES_BY_AREA,
    createEmptyNewShiftRow,
    defaultNewShiftRows,
    type AreaId,
    type MachineId,
    type NewShiftRow,
    type ShiftPosition,
} from "../../model/shift-handover-mock";
import { positionLabel, validateShiftHandover } from "../../model/validate-shift-handover";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/kit/dialog";
import { Icon } from "@/shared/ui/kit/icon";
import { Informer } from "@/shared/ui/kit/informer";
import { Label } from "@/shared/ui/kit/label";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";

const selectClass =
    "h-9 w-full rounded-sm border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function roleLabel(role: "winding" | "unwinding" | ""): string {
    if (role === "winding") return "Намотка";
    if (role === "unwinding") return "Размотка";
    return "";
}

function deleteShiftRowAriaLabel(employeeId: string): string {
    const name = MOCK_EMPLOYEES.find((e) => e.id === employeeId)?.name;
    return name ? `Удалить строку ${name}` : "Удалить строку";
}

export function ShiftHandoverDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [areaId, setAreaId] = useState<AreaId>("print");
    const [machineId, setMachineId] = useState<MachineId>("pr120");
    const [rows, setRows] = useState<NewShiftRow[]>(() => defaultNewShiftRows());
    const [handoverCompleted, setHandoverCompleted] = useState(false);

    const machines = useMemo(() => MOCK_MACHINES_BY_AREA[areaId], [areaId]);

    useEffect(() => {
        if (!open) return;
        const t = window.setTimeout(() => {
            setAreaId("print");
            setMachineId("pr120");
            setRows(defaultNewShiftRows());
            setHandoverCompleted(false);
        }, 0);
        return () => window.clearTimeout(t);
    }, [open]);

    const validation = useMemo(() => validateShiftHandover(rows), [rows]);

    const updateRow = (id: string, patch: Partial<NewShiftRow>) => {
        setRows((prev) =>
            prev.map((r) => {
                if (r.id !== id) return r;
                const next = { ...r, ...patch };
                if (patch.position === "operator") {
                    next.assistantRole = "";
                }
                return next;
            }),
        );
    };

    const addRow = () => {
        setRows((prev) => [...prev, createEmptyNewShiftRow()]);
    };

    const removeRow = (id: string) => {
        setRows((prev) => prev.filter((r) => r.id !== id));
    };

    const submit = () => {
        if (!validation.ok || handoverCompleted) return;
        setHandoverCompleted(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                size="xl"
                className="max-h-[min(90vh,900px)] gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,88rem)]"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <div
                    className={cn(
                        "max-h-[min(90vh,900px)] overflow-y-auto p-6",
                        handoverCompleted && "pointer-events-none opacity-60",
                    )}
                >
                    <DialogHeader className="mb-4 space-y-1 text-left">
                        <DialogTitle>Передача смены</DialogTitle>
                    </DialogHeader>

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-1.5 max-w-[280px]">
                            <Label htmlFor="shift-handover-area" className={comboboxFieldLabelClassName}>
                                Выберите участок
                            </Label>
                            <select
                                id="shift-handover-area"
                                className={selectClass}
                                value={areaId}
                                onChange={(e) => {
                                    const id = e.target.value as AreaId;
                                    setAreaId(id);
                                    const nextMachines = MOCK_MACHINES_BY_AREA[id];
                                    setMachineId(nextMachines[0]?.id ?? machineId);
                                }}
                            >
                                {MOCK_AREAS.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-1.5 max-w-[280px]">
                            <Label htmlFor="shift-handover-machine" className={comboboxFieldLabelClassName}>
                                Выберите машину
                            </Label>
                            <select
                                id="shift-handover-machine"
                                className={selectClass}
                                value={machineId}
                                onChange={(e) => setMachineId(e.target.value as MachineId)}
                            >
                                {machines.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="flex min-w-0 flex-col gap-6 border-border lg:border-r">
                            <section className="min-w-0 space-y-2">
                                <h3 className={cnSectionBlockTitle()}>Текущий заказ</h3>
                                <div className={dataTableScrollViewportClassName}>
                                    <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                                        <TableHeader className="bg-muted/40">
                                            <TableRow>
                                                <TableHead className={cn(dataTableStickyHeadCellClassName, "w-[40%]")}>
                                                    Параметр
                                                </TableHead>
                                                <TableHead className={dataTableStickyHeadCellClassName}>Значение</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>
                                                    Проект
                                                </TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>
                                                    {MOCK_CURRENT_ORDER.project}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>
                                                    Продукт
                                                </TableCell>
                                                <TableCell className={cn(dataTableBodyCellClassName, "break-words")}>
                                                    {MOCK_CURRENT_ORDER.product}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground")}>
                                                    Клиент
                                                </TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>
                                                    {MOCK_CURRENT_ORDER.client}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </section>

                            <section className="min-w-0 space-y-2">
                                <h3 className={cnSectionBlockTitle()}>Текущая смена</h3>
                                <div className={dataTableScrollViewportClassName}>
                                    <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                                        <TableHeader className="bg-muted/40">
                                            <TableRow>
                                                <TableHead className={dataTableStickyHeadCellClassName}>Должность</TableHead>
                                                <TableHead className={dataTableStickyHeadCellClassName}>Роль</TableHead>
                                                <TableHead className={dataTableStickyHeadCellClassName}>ФИО</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {MOCK_CURRENT_SHIFT.map((m, i) => (
                                                <TableRow key={`${m.name}-${i}`}>
                                                    <TableCell className={dataTableBodyCellClassName}>
                                                        {positionLabel(m.position)}
                                                    </TableCell>
                                                    <TableCell className={dataTableBodyCellClassName}>{m.roleLabel}</TableCell>
                                                    <TableCell className={dataTableBodyCellClassName}>{m.name}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </section>
                        </div>

                        <div className="flex min-w-0 flex-col gap-3">
                            <section className="min-w-0 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className={cnSectionBlockTitle()}>Новая смена</h3>
                                    <Button type="button" size="sm" variant="default" className="gap-1" onClick={addRow}>
                                        <Icon name="add" size="sm" />
                                        Добавить строку
                                    </Button>
                                </div>
                                <div className={dataTableScrollViewportClassName}>
                                    <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                                        <TableHeader className="bg-muted/40">
                                            <TableRow>
                                                <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[8.5rem]")}>
                                                    Должность
                                                </TableHead>
                                                <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[7rem]")}>
                                                    Роль
                                                </TableHead>
                                                <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[10rem]")}>
                                                    ФИО
                                                </TableHead>
                                                <TableHead className={cn(dataTableStickyHeadCellClassName, "w-12")} />
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rows.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell className={dataTableBodyCellClassName}>
                                                        <select
                                                            className={selectClass}
                                                            aria-label="Должность"
                                                            value={row.position}
                                                            onChange={(e) =>
                                                                updateRow(row.id, {
                                                                    position: e.target.value as ShiftPosition | "",
                                                                })
                                                            }
                                                        >
                                                            <option value="">Не выбрано</option>
                                                            <option value="operator">Оператор</option>
                                                            <option value="assistant">Помощник оператора</option>
                                                        </select>
                                                    </TableCell>
                                                    <TableCell className={dataTableBodyCellClassName}>
                                                        {row.position === "operator" ? (
                                                            <span className="flex h-9 items-center px-2 text-muted-foreground">
                                                                —
                                                            </span>
                                                        ) : (
                                                            <select
                                                                className={selectClass}
                                                                aria-label="Роль"
                                                                value={row.assistantRole}
                                                                onChange={(e) =>
                                                                    updateRow(row.id, {
                                                                        assistantRole: e.target.value as
                                                                            | "winding"
                                                                            | "unwinding"
                                                                            | "",
                                                                    })
                                                                }
                                                            >
                                                                <option value="">Не выбрано</option>
                                                                <option value="winding">{roleLabel("winding")}</option>
                                                                <option value="unwinding">
                                                                    {roleLabel("unwinding")}
                                                                </option>
                                                            </select>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className={dataTableBodyCellClassName}>
                                                        <select
                                                            className={selectClass}
                                                            aria-label="Сотрудник"
                                                            value={row.employeeId}
                                                            onChange={(e) =>
                                                                updateRow(row.id, { employeeId: e.target.value })
                                                            }
                                                        >
                                                            <option value="">Не выбрано</option>
                                                            {MOCK_EMPLOYEES.map((e) => (
                                                                <option key={e.id} value={e.id}>
                                                                    {e.name}
                                                                    {e.busyOnAnotherMachine ? " (занят)" : ""}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </TableCell>
                                                    <TableCell className={dataTableBodyCellClassName}>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            className="text-muted-foreground hover:text-destructive"
                                                            onClick={() => removeRow(row.id)}
                                                            aria-label={deleteShiftRowAriaLabel(row.employeeId)}
                                                        >
                                                            <Icon name="delete" className="text-base" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </section>

                            {handoverCompleted ? (
                                <Informer
                                    tone="success"
                                    variant="filled"
                                    title="Смена передана"
                                    description="Закройте окно кнопкой «Отмена»."
                                />
                            ) : validation.ok ? (
                                <Informer
                                    tone="success"
                                    variant="filled"
                                    title="Передача смены разрешена"
                                    description="Все проверки успешно пройдены"
                                />
                            ) : (
                                <Informer
                                    tone="alert"
                                    variant="filled"
                                    title="Передача смены недоступна"
                                    description={validation.message}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t bg-muted/30 px-6 py-4 sm:justify-end">
                    <Button
                        type="button"
                        variant="default"
                        disabled={!validation.ok || handoverCompleted}
                        onClick={submit}
                    >
                        Передать смену
                    </Button>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
