import { useCallback, useEffect, useMemo, useState } from "react";

import type { MachineData, MachineId, OperatorDowntimeRow } from "../../model/types";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { Button } from "@/shared/ui/kit/button";
import { Informer } from "@/shared/ui/kit/informer";
import { Label } from "@/shared/ui/kit/label";
import { cn } from "@/shared/lib/css";
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
const selectClass =
    "h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

function formatHms(totalSeconds: number): string {
    const s = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(h)}:${p(m)}:${p(sec)}`;
}

function cloneRows(rows: OperatorDowntimeRow[]): OperatorDowntimeRow[] {
    return rows.map((r) => ({ ...r }));
}

function downtimePanelKey(panel: MachineData["operator"]["downtimes"]): string {
    return `${panel.uiMode}|${panel.rows.map((r) => r.id).join(",")}|${panel.defaultSelectedIds.join(",")}`;
}

export function OrderExecutionDowntimesSection({ operator, machineId }: Props) {
    const panel = operator.downtimes;
    const [rows, setRows] = useState(() => cloneRows(panel.rows));
    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(panel.defaultSelectedIds));
    const [category, setCategory] = useState(panel.formDefaults.category);
    const [subcategory, setSubcategory] = useState(panel.formDefaults.subcategory);
    const [reason, setReason] = useState(panel.formDefaults.reason);
    const [notes, setNotes] = useState("");
    const [anchorMs, setAnchorMs] = useState<number | null>(null);
    const [timerSeconds, setTimerSeconds] = useState(0);

    const panelSig = downtimePanelKey(panel);

    useEffect(() => {
        const t = window.setTimeout(() => {
            const p = operator.downtimes;
            setRows(cloneRows(p.rows));
            setSelectedIds(new Set(p.defaultSelectedIds));
            setCategory(p.formDefaults.category);
            setSubcategory(p.formDefaults.subcategory);
            setReason(p.formDefaults.reason);
            setNotes("");
            if (p.uiMode === "active" && typeof p.activeSinceOffsetSeconds === "number") {
                setAnchorMs(Date.now() - p.activeSinceOffsetSeconds * 1000);
            } else {
                setAnchorMs(null);
            }
        }, 0);
        return () => window.clearTimeout(t);
    }, [machineId, panelSig, operator.downtimes]);

    useEffect(() => {
        if (anchorMs == null) {
            const clearT = window.setTimeout(() => setTimerSeconds(0), 0);
            return () => window.clearTimeout(clearT);
        }
        const tick = () =>
            setTimerSeconds(Math.max(0, Math.floor((Date.now() - anchorMs) / 1000)));
        const boot = window.setTimeout(tick, 0);
        const id = window.setInterval(tick, 1000);
        return () => {
            window.clearTimeout(boot);
            window.clearInterval(id);
        };
    }, [anchorMs]);

    const incompleteCount = useMemo(() => rows.filter((r) => !r.category.trim()).length, [rows]);

    const timerLabel = formatHms(timerSeconds);

    const headerTone =
        panel.uiMode === "active" || panel.uiMode === "unregistered_pending" || incompleteCount > 0
            ? "alert"
            : undefined;
    const headerCount =
        incompleteCount > 0
            ? incompleteCount
            : panel.uiMode === "active" || panel.uiMode === "unregistered_pending"
              ? 1
              : undefined;

    const toggleRow = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const canSave = useMemo(() => {
        for (const id of selectedIds) {
            const r = rows.find((x) => x.id === id);
            if (r && !r.category.trim()) return true;
        }
        return false;
    }, [rows, selectedIds]);

    const handleSave = useCallback(() => {
        if (!canSave) return;
        setRows((prev) =>
            prev.map((r) => {
                if (!selectedIds.has(r.id) || r.category.trim()) return r;
                return {
                    ...r,
                    category,
                    subcategory,
                    reason,
                    note: notes.trim() || undefined,
                };
            }),
        );
        setNotes("");
    }, [canSave, category, notes, reason, selectedIds, subcategory]);

    const showActiveBanner = panel.uiMode === "active";
    const showUnregisteredBanner = panel.uiMode === "unregistered_pending";

    return (
        <OrderExecutionCollapsibleSection
            title="Простои"
            defaultOpen={false}
            tone={headerTone}
            count={headerCount}
        >
            <div className="flex flex-col gap-4">
                {showActiveBanner ? (
                    <Informer
                        tone="warning"
                        variant="filled"
                        size="s"
                        title={`Идёт простой - ${timerLabel}`}
                        description="Заполните форму ниже и нажмите кнопку «Сохранить описание»."
                    />
                ) : null}
                {showUnregisteredBanner ? (
                    <Informer
                        tone="warning"
                        variant="filled"
                        size="s"
                        title={`Обнаружен неучтенный простой длительностью ${panel.unregisteredDurationLabel ?? "—"}`}
                        description="Заполните форму ниже и нажмите кнопку «Сохранить описание»."
                    />
                ) : null}

                <div>
                    <div className={blockTitleClass}>Таблица зафиксированных простоев</div>
                    <div className={dataTableScrollViewportClassName}>
                        <Table className={cn(dataTableShellClassName, "min-w-[720px]", "text-[12px]")}>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "w-10")} aria-label="Выбор" />
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[150px]")}>Начало</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[150px]")}>Завершение</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[120px]")}>Категория</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[120px]")}>Подкатегория</TableHead>
                                    <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[140px]")}>Причина</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className={dataTableBodyCellClassName}>
                                            <input
                                                type="checkbox"
                                                className="size-4 accent-primary"
                                                checked={selectedIds.has(row.id)}
                                                onChange={() => toggleRow(row.id)}
                                                aria-label={`Выбрать простой ${row.id}`}
                                            />
                                        </TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.startAt}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.endAt}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>
                                            {row.category.trim() ? row.category : "—"}
                                        </TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>
                                            {row.subcategory.trim() ? row.subcategory : "—"}
                                        </TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>
                                            {row.reason.trim() ? row.reason : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div>
                    <div className={blockTitleClass}>Зафиксировать простой</div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="dt-cat" className="text-[11px] font-medium text-muted-foreground">
                                Категория
                            </Label>
                            <select
                                id="dt-cat"
                                className={selectClass}
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {panel.categoryOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="dt-sub" className="text-[11px] font-medium text-muted-foreground">
                                Подкатегория
                            </Label>
                            <select
                                id="dt-sub"
                                className={selectClass}
                                value={subcategory}
                                onChange={(e) => setSubcategory(e.target.value)}
                            >
                                {panel.subcategoryOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="dt-reason" className="text-[11px] font-medium text-muted-foreground">
                                Причина
                            </Label>
                            <select
                                id="dt-reason"
                                className={selectClass}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            >
                                {panel.reasonOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-3 grid gap-1.5">
                        <Label htmlFor="dt-notes" className="text-[11px] font-medium text-muted-foreground">
                            Примечания
                        </Label>
                        <textarea
                            id="dt-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Заполните при необходимости"
                            rows={3}
                            className={cn(
                                "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input min-h-[72px] w-full resize-y rounded-sm border bg-transparent px-3 py-2 text-sm shadow-xs outline-none",
                                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                            )}
                        />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button type="button" size="sm" onClick={handleSave} disabled={!canSave}>
                            Сохранить описание
                        </Button>
                    </div>
                </div>
            </div>
        </OrderExecutionCollapsibleSection>
    );
}
