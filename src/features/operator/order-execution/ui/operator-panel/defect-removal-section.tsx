import { useCallback, useEffect, useMemo, useState } from "react";

import type { MachineData, MachineId, OperatorDefectRemovalHistoryRow } from "../../model/types";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionSimpleTable } from "../simple-table";
import { Button } from "@/shared/ui/kit/button";
import { Informer } from "@/shared/ui/kit/informer";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { cn } from "@/shared/lib/css";
import { createRandomId } from "@/shared/lib/create-random-id";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

type Props = {
    operator: MachineData["operator"];
    machineId: MachineId;
};

const blockTitleClass = cnSectionBlockTitle("pb-2");
const colHeaderClass = "text-[11px] uppercase tracking-wide text-foreground";
const selectClass =
    "h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

function formatRemovalTimestamp(): string {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
}

function newRemovalId(): string {
    return createRandomId("rm-");
}

function cloneHistory(rows: OperatorDefectRemovalHistoryRow[]): OperatorDefectRemovalHistoryRow[] {
    return rows.map((r) => ({ ...r }));
}

export function OrderExecutionDefectRemovalSection({ operator, machineId }: Props) {
    const { defectRemoval } = operator;
    const [history, setHistory] = useState(() => cloneHistory(defectRemoval.history));
    const [scaleId, setScaleId] = useState(defectRemoval.formDefaults.scaleId);
    const [rollId, setRollId] = useState(defectRemoval.formDefaults.rollId);
    const [defectType, setDefectType] = useState(defectRemoval.formDefaults.defectType);
    const [weightKg, setWeightKg] = useState(defectRemoval.formDefaults.weightKg);
    const [note, setNote] = useState("");

    const historyKey = defectRemoval.history.map((r) => r.id).join("|");

    useEffect(() => {
        const dr = operator.defectRemoval;
        setHistory(cloneHistory(dr.history));
        setScaleId(dr.formDefaults.scaleId);
        setRollId(dr.formDefaults.rollId);
        setDefectType(dr.formDefaults.defectType);
        setWeightKg(dr.formDefaults.weightKg);
        setNote("");
    }, [machineId, historyKey, operator.defectRemoval]);

    const headerAlert = defectRemoval.headerAlertCount ?? 0;
    const headerTone = headerAlert > 0 ? "alert" : undefined;
    const headerCount = headerAlert > 0 ? headerAlert : undefined;

    const handleRegister = useCallback(() => {
        const w = weightKg.trim();
        if (!w) return;
        const lengthM = String(Math.round(40 + Math.random() * 220));
        const row: OperatorDefectRemovalHistoryRow = {
            id: newRemovalId(),
            registeredAt: formatRemovalTimestamp(),
            weightKg: w,
            lengthM,
            defect: defectType || "—",
            note: note.trim() || "—",
        };
        setHistory((prev) => [row, ...prev]);
        setNote("");
        setWeightKg(defectRemoval.formDefaults.weightKg);
    }, [defectType, defectRemoval.formDefaults.weightKg, note, weightKg]);

    const showManualWeighInformer = useMemo(() => headerAlert > 0, [headerAlert]);

    return (
        <OrderExecutionCollapsibleSection
            title="Брак. Удаление"
            defaultOpen={false}
            tone={headerTone}
            count={headerCount}
        >
            <div className="flex flex-col gap-4">
                {showManualWeighInformer ? (
                    <Informer
                        tone="warning"
                        variant="filled"
                        size="s"
                        title="Внимание"
                        description="Вес не подставился автоматически с весов — проверьте связь (US-68) или введите значение вручную (А1)."
                    />
                ) : null}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="grid gap-1.5">
                        <Label htmlFor="defect-removal-scale" className="text-[11px] font-medium text-muted-foreground">
                            Весы
                        </Label>
                        <select
                            id="defect-removal-scale"
                            className={selectClass}
                            value={scaleId}
                            onChange={(e) => setScaleId(e.target.value)}
                        >
                            {defectRemoval.scaleOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="defect-removal-roll" className="text-[11px] font-medium text-muted-foreground">
                            Рулон
                        </Label>
                        <select
                            id="defect-removal-roll"
                            className={selectClass}
                            value={rollId}
                            onChange={(e) => setRollId(e.target.value)}
                        >
                            {defectRemoval.rollOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="defect-removal-type" className="text-[11px] font-medium text-muted-foreground">
                            Тип брака
                        </Label>
                        <select
                            id="defect-removal-type"
                            className={selectClass}
                            value={defectType}
                            onChange={(e) => setDefectType(e.target.value)}
                        >
                            {defectRemoval.defectTypeOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="defect-removal-weight" className="text-[11px] font-medium text-muted-foreground">
                            Вес, кг
                        </Label>
                        <Input
                            id="defect-removal-weight"
                            className="h-9"
                            inputMode="decimal"
                            value={weightKg}
                            onChange={(e) => setWeightKg(e.target.value)}
                            aria-label="Вес брака, кг"
                        />
                    </div>
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="defect-removal-note" className="text-[11px] font-medium text-muted-foreground">
                        Примечание
                    </Label>
                    <textarea
                        id="defect-removal-note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Заполните при необходимости"
                        rows={3}
                        className={cn(
                            "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input min-h-[72px] w-full resize-y rounded-sm border bg-transparent px-3 py-2 text-sm shadow-xs outline-none",
                            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        )}
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="button" size="sm" onClick={handleRegister} disabled={!weightKg.trim()}>
                        Зарегистрировать брак
                    </Button>
                </div>

                <div>
                    <div className={blockTitleClass}>Брак удалённый</div>
                    <OrderExecutionSimpleTable
                        columns={[
                            {
                                key: "registeredAt",
                                label: "Регистрация",
                                headerClassName: colHeaderClass,
                            },
                            {
                                key: "weightKg",
                                label: "Вес, кг",
                                align: "right",
                                headerClassName: colHeaderClass,
                            },
                            {
                                key: "lengthM",
                                label: "Метраж, м",
                                align: "right",
                                headerClassName: colHeaderClass,
                            },
                            { key: "defect", label: "Дефект", headerClassName: colHeaderClass },
                            { key: "note", label: "Примечание", headerClassName: colHeaderClass },
                        ]}
                        rows={history.map((r) => ({
                            registeredAt: r.registeredAt,
                            weightKg: r.weightKg,
                            lengthM: r.lengthM,
                            defect: r.defect,
                            note: r.note,
                        }))}
                    />
                </div>
            </div>
        </OrderExecutionCollapsibleSection>
    );
}
