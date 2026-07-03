import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/shared/lib/css";
import type { MachineData, MachineId, MachineParamTableRow, PendingKnifeStrike } from "../../model/types";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionSimpleTable } from "../simple-table";
import { Button } from "@/shared/ui/kit/button";
import { Informer } from "@/shared/ui/kit/informer";
import { InformerPill } from "@/shared/ui/kit/informer-pill";
import { Label } from "@/shared/ui/kit/label";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";

type Props = {
    operator: MachineData["operator"];
    machineId: MachineId;
};

const blockTitleClass = cnSectionBlockTitle("pb-2");
const colHeaderClass = "text-[11px] uppercase tracking-wide text-foreground";

function formatStrikeTimestamp(): string {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
}

function rowInTolerance(row: MachineParamTableRow): boolean {
    if (typeof row.inTolerance === "boolean") return row.inTolerance;
    const c = Number(String(row.current).replace(",", "."));
    const t = Number(String(row.target).replace(",", "."));
    if (Number.isFinite(c) && Number.isFinite(t)) return c === t;
    return row.current === row.target;
}

function pendingKey(pending: PendingKnifeStrike | null): string {
    if (!pending) return "";
    return `${pending.bannerTitle}|${pending.queueCount}|${pending.reasonOptions.join(",")}`;
}

export function OrderExecutionMachineDataSection({ operator, machineId }: Props) {
    const [resolved, setResolved] = useState(false);
    const [extraHistory, setExtraHistory] = useState<MachineData["operator"]["machineEvents"]>([]);
    const [selectedReason, setSelectedReason] = useState("");
    const [comment, setComment] = useState("");

    const pending = operator.pendingKnifeStrike;
    const pendingSignature = pendingKey(pending);

    useEffect(() => {
        setResolved(false);
        setExtraHistory([]);
        setComment("");
        if (pending) {
            setSelectedReason(pending.selectedReason ?? pending.reasonOptions[0] ?? "");
        } else {
            setSelectedReason("");
        }
    }, [machineId, pendingSignature]);

    const showPendingForm = Boolean(pending) && !resolved;

    const headerCount = showPendingForm ? pending!.queueCount : 0;
    const headerTone = headerCount > 0 ? "alert" : undefined;

    const historyRows = useMemo(() => {
        const base = operator.machineEvents;
        return [...extraHistory, ...base];
    }, [extraHistory, operator.machineEvents]);

    const handleSave = useCallback(() => {
        if (!pending || !selectedReason) return;
        setExtraHistory((prev) => [{ time: formatStrikeTimestamp(), reason: selectedReason }, ...prev]);
        setResolved(true);
        setComment("");
    }, [pending, selectedReason]);

    return (
        <OrderExecutionCollapsibleSection
            title="Данные с машин"
            defaultOpen={false}
            tone={headerTone}
            count={headerCount > 0 ? headerCount : undefined}
        >
            <div className="grid gap-4">
                {showPendingForm ? (
                    <>
                        <Informer
                            tone="warning"
                            variant="filled"
                            size="s"
                            title={pending!.bannerTitle}
                            description={pending!.bannerMessage}
                        />

                        <div className="rounded-sm border border-border bg-background/60 p-3">
                            <div className={blockTitleClass}>Удар ножа</div>
                            <div className="grid gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="knife-strike-reason" className={comboboxFieldLabelClassName}>
                                        Причина удара ножа
                                    </Label>
                                    <div className="flex flex-wrap items-stretch gap-2">
                                        <select
                                            id="knife-strike-reason"
                                            value={selectedReason}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="h-9 min-w-[200px] flex-1 rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                        >
                                            {pending!.reasonOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                        <Button type="button" size="sm" className="shrink-0" onClick={handleSave}>
                                            Сохранить
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="knife-strike-comment" className={comboboxFieldLabelClassName}>
                                        Комментарий
                                    </Label>
                                    <textarea
                                        id="knife-strike-comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Заполните при необходимости"
                                        rows={3}
                                        className={cn(
                                            "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input min-h-[72px] w-full resize-y rounded-sm border bg-transparent px-3 py-2 text-sm shadow-xs outline-none",
                                            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}

                <div>
                    <div className={blockTitleClass}>Удары ножа</div>
                    <OrderExecutionSimpleTable
                        columns={[
                            { key: "time", label: "Время", headerClassName: colHeaderClass },
                            { key: "reason", label: "Причина", headerClassName: colHeaderClass },
                        ]}
                        rows={historyRows.map((e) => ({ time: e.time, reason: e.reason }))}
                    />
                </div>

                <div>
                    <div className={blockTitleClass}>Таблица данных с машины</div>
                    {showPendingForm ? (
                        <OrderExecutionSimpleTable
                            columns={[
                                {
                                    key: "parameter",
                                    label: "Имя параметра",
                                    headerClassName: colHeaderClass,
                                },
                                { key: "value", label: "Значение", align: "right", headerClassName: colHeaderClass },
                                {
                                    key: "status",
                                    label: "Норма/отклонение",
                                    headerClassName: colHeaderClass,
                                },
                            ]}
                            rows={operator.paramsTable.map((p) => {
                                const ok = rowInTolerance(p);
                                return {
                                    parameter: p.parameter,
                                    value: p.current,
                                    status: ok ? (
                                        <InformerPill tone="success" variant="filled">
                                            НОРМА
                                        </InformerPill>
                                    ) : (
                                        <InformerPill tone="alert" variant="filled">
                                            ОТКЛОНЕНИЕ
                                        </InformerPill>
                                    ),
                                };
                            })}
                        />
                    ) : (
                        <OrderExecutionSimpleTable
                            columns={[
                                {
                                    key: "parameter",
                                    label: "Имя параметра",
                                    headerClassName: colHeaderClass,
                                },
                                {
                                    key: "current",
                                    label: "Текущее значение",
                                    align: "right",
                                    headerClassName: colHeaderClass,
                                },
                                {
                                    key: "target",
                                    label: "Целевое значение",
                                    align: "right",
                                    headerClassName: colHeaderClass,
                                },
                            ]}
                            rows={operator.paramsTable.map((p) => ({
                                parameter: p.parameter,
                                current: p.current,
                                target: p.target,
                            }))}
                        />
                    )}
                </div>
            </div>
        </OrderExecutionCollapsibleSection>
    );
}
