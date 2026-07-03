import { useCallback, useEffect, useMemo, useState } from "react";

import type { MachineData, MachineId, OperatorDefectRegistrationRow } from "../../model/types";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { Button } from "@/shared/ui/kit/button";
import { Icon } from "@/shared/ui/kit/icon";
import { Informer } from "@/shared/ui/kit/informer";
import { Input } from "@/shared/ui/kit/input";
import { cn } from "@/shared/lib/css";
import { createRandomId } from "@/shared/lib/create-random-id";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

type Props = {
    operator: MachineData["operator"];
    machineId: MachineId;
};

const blockTitleClass = cnSectionBlockTitle("pb-2");
const cellSelectClass =
    "h-8 w-full min-w-[96px] max-w-[200px] rounded-sm border border-input bg-background px-2 text-[12px] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

function countIncomplete(rows: OperatorDefectRegistrationRow[]): number {
    return rows.filter((r) => !r.defectType.trim()).length;
}

function cloneRows(rows: OperatorDefectRegistrationRow[]): OperatorDefectRegistrationRow[] {
    return rows.map((r) => ({ ...r }));
}

export function OrderExecutionDefectRegistrationSection({ operator, machineId }: Props) {
    const { defectRegistration } = operator;
    const [rows, setRows] = useState(() => cloneRows(defectRegistration.rows));
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
        const first = defectRegistration.rows[0]?.id;
        return first ? new Set([first]) : new Set();
    });
    const [flyStage, setFlyStage] = useState<"idle" | "started">("idle");
    const [flyStartM, setFlyStartM] = useState<string | null>(null);

    const rowsSignature = defectRegistration.rows.map((r) => r.id).join("|");

    useEffect(() => {
        const t = window.setTimeout(() => {
            setRows(cloneRows(defectRegistration.rows));
            const first = defectRegistration.rows[0]?.id;
            setSelectedIds(first ? new Set([first]) : new Set());
            setFlyStage("idle");
            setFlyStartM(null);
            setSearch("");
        }, 0);
        return () => window.clearTimeout(t);
    }, [machineId, rowsSignature, defectRegistration.rows]);

    const incomplete = useMemo(() => countIncomplete(rows), [rows]);

    const canRegister = rows.length > 0 && incomplete === 0;

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => {
            const hay = `${r.roll} ${r.defectType} ${r.status} ${r.startM} ${r.endM}`.toLowerCase();
            return hay.includes(q);
        });
    }, [rows, search]);

    const toggleSelected = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const updateRow = useCallback((id: string, patch: Partial<OperatorDefectRegistrationRow>) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    }, []);

    const addRow = useCallback(() => {
        const roll = defectRegistration.rollOptions[0] ?? "—";
        const flag = defectRegistration.flagOptions[0] ?? "—";
        const status = defectRegistration.statusOptions[0] ?? "—";
        const id = createRandomId("dr-");
        setRows((prev) => [
            ...prev,
            {
                id,
                startM: "",
                endM: "",
                defectType: "",
                flag1: flag,
                flag2: flag,
                status,
                roll,
            },
        ]);
    }, [defectRegistration.flagOptions, defectRegistration.rollOptions, defectRegistration.statusOptions]);

    const deleteSelected = useCallback(() => {
        if (selectedIds.size === 0) return;
        setRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
        setSelectedIds(new Set());
    }, [selectedIds]);

    const registerDefects = useCallback(() => {
        if (!canRegister) return;
        setFlyStage("idle");
        setFlyStartM(null);
    }, [canRegister]);

    const handleStartFly = useCallback(() => {
        setFlyStage("started");
        setFlyStartM(String(Math.round(3000 + Math.random() * 200)));
    }, []);

    const handleEndFly = useCallback(() => {
        if (flyStage !== "started" || !flyStartM) return;
        const endM = String(Number(flyStartM) + Math.round(150 + Math.random() * 120));
        const roll = defectRegistration.rollOptions[0] ?? "Р-120";
        const id = createRandomId("dr-fly-");
        setRows((prev) => [
            {
                id,
                startM: flyStartM,
                endM,
                defectType: "",
                flag1: defectRegistration.flagOptions[0] ?? "—",
                flag2: defectRegistration.flagOptions[1] ?? "—",
                status: defectRegistration.statusOptions[1] ?? "Активно",
                roll,
            },
            ...prev,
        ]);
        setFlyStage("idle");
        setFlyStartM(null);
    }, [defectRegistration.flagOptions, defectRegistration.rollOptions, defectRegistration.statusOptions, flyStage, flyStartM]);

    const headerTone = incomplete > 0 ? "alert" : undefined;
    const headerCount = incomplete > 0 ? incomplete : undefined;

    return (
        <OrderExecutionCollapsibleSection
            title="Брак. Регистрация"
            defaultOpen={false}
            tone={headerTone}
            count={headerCount}
        >
            <div className="flex flex-col gap-4">
                <div>
                    <div className={blockTitleClass}>Фиксация брака на ходу</div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" onClick={handleStartFly} disabled={flyStage === "started"}>
                            Начало брака
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={flyStage === "started" ? "default" : "secondary"}
                            onClick={handleEndFly}
                            disabled={flyStage !== "started"}
                        >
                            Окончание брака
                        </Button>
                    </div>
                    <div className="mt-3">
                        <Informer
                            tone="normal"
                            variant="bordered"
                            size="s"
                            title="Информация"
                            description='При фиксации брака на ходу последовательно нажмите кнопки «Начало брака» / «Окончание брака» для фиксации метража брака. Запись будет создана в таблице ниже.'
                        />
                    </div>
                </div>

                <div>
                    <div className={blockTitleClass}>Зарегистрировать брак</div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <div className="relative min-w-0 flex-1 max-w-md">
                            <Icon
                                name="search"
                                className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-lg"
                            />
                            <Input
                                className="pl-9 h-9"
                                placeholder="Поиск"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                aria-label="Поиск в таблице брака"
                            />
                        </div>
                        <Button type="button" size="sm" onClick={addRow}>
                            + Добавить строку
                        </Button>
                    </div>

                    <div className={dataTableScrollViewportClassName}>
                        <Table className={cn(dataTableShellClassName, "min-w-[960px]", "text-[12px]")}>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-10")} aria-label="Выбор" />
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-[88px]")}>Начало</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-[88px]")}>Окончание</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[120px]")}>Тип дефекта</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[100px]")}>Флаг 1</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[100px]")}>Флаг 2</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[110px]")}>Статус</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[100px]")}>Рулон</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell className={cn(dataTableBodyCellClassName, "text-muted-foreground py-6 text-center")} colSpan={8}>
                                            Нет строк по фильтру
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className={dataTableBodyCellClassName}>
                                                <input
                                                    type="checkbox"
                                                    className="size-4 accent-primary"
                                                    checked={selectedIds.has(row.id)}
                                                    onChange={() => toggleSelected(row.id)}
                                                    aria-label={`Выбрать строку ${row.id}`}
                                                />
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>
                                                <Input
                                                    className="h-8"
                                                    inputMode="numeric"
                                                    value={row.startM}
                                                    onChange={(e) => updateRow(row.id, { startM: e.target.value })}
                                                    aria-label="Начало, м"
                                                />
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>
                                                <Input
                                                    className="h-8"
                                                    inputMode="numeric"
                                                    value={row.endM}
                                                    onChange={(e) => updateRow(row.id, { endM: e.target.value })}
                                                    aria-label="Окончание, м"
                                                />
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>
                                                <select
                                                    className={cellSelectClass}
                                                    value={row.defectType}
                                                    onChange={(e) => updateRow(row.id, { defectType: e.target.value })}
                                                    aria-label="Тип дефекта"
                                                >
                                                    <option value="">—</option>
                                                    {defectRegistration.defectTypeOptions.map((opt) => (
                                                        <option key={opt} value={opt}>
                                                            {opt}
                                                        </option>
                                                    ))}
                                                </select>
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>
                                                <select
                                                    className={cellSelectClass}
                                                    value={row.flag1}
                                                    onChange={(e) => updateRow(row.id, { flag1: e.target.value })}
                                                    aria-label="Флаг 1"
                                                >
                                                    {defectRegistration.flagOptions.map((opt) => (
                                                        <option key={opt} value={opt}>
                                                            {opt}
                                                        </option>
                                                    ))}
                                                </select>
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>
                                                <select
                                                    className={cellSelectClass}
                                                    value={row.flag2}
                                                    onChange={(e) => updateRow(row.id, { flag2: e.target.value })}
                                                    aria-label="Флаг 2"
                                                >
                                                    {defectRegistration.flagOptions.map((opt) => (
                                                        <option key={opt} value={opt}>
                                                            {opt}
                                                        </option>
                                                    ))}
                                                </select>
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>
                                                <select
                                                    className={cellSelectClass}
                                                    value={row.status}
                                                    onChange={(e) => updateRow(row.id, { status: e.target.value })}
                                                    aria-label="Статус"
                                                >
                                                    {defectRegistration.statusOptions.map((opt) => (
                                                        <option key={opt} value={opt}>
                                                            {opt}
                                                        </option>
                                                    ))}
                                                </select>
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>
                                                <select
                                                    className={cellSelectClass}
                                                    value={row.roll}
                                                    onChange={(e) => updateRow(row.id, { roll: e.target.value })}
                                                    aria-label="Рулон"
                                                >
                                                    {defectRegistration.rollOptions.map((opt) => (
                                                        <option key={opt} value={opt}>
                                                            {opt}
                                                        </option>
                                                    ))}
                                                </select>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <Button type="button" size="sm" onClick={registerDefects} disabled={!canRegister}>
                            Зарегистрировать брак
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={deleteSelected} disabled={selectedIds.size === 0}>
                            Удалить запись
                        </Button>
                    </div>
                </div>
            </div>
        </OrderExecutionCollapsibleSection>
    );
}
