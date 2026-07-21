import { useState } from "react";

import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { Label } from "@/shared/ui/kit/label";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

import type { ProductionPlanMachine } from "@/features/operator/production-plan/model/types";

import type { StageProgressInfoItem } from "../model/stage-progress/types";
import type { MachineData } from "../model/types";

type JobInfoItem = { key: string; value: string };

type OrderExecutionFiltersProps = {
    machineOptions: ProductionPlanMachine[];
    isMachineOptionsLoading: boolean;
    selectedMachine: string | null;
    onMachineChange: (resourceCode: string) => void;
    /** Если этапа нет — блок с данными заказа не показываем */
    jobInfo: MachineData["operator"]["jobInfo"] | null;
    /** План / выпуск / остаток / прогресс (getProgress) */
    progressInfo?: StageProgressInfoItem[] | null;
};

function OrderExecutionJobInfoStrip({
    items,
    className,
}: {
    items: JobInfoItem[];
    className?: string;
}) {
    return (
        <dl
            className={cn(
                "app-scroll flex min-w-0 flex-1 flex-nowrap items-baseline gap-x-6 overflow-x-auto",
                className,
            )}
        >
            {items.map((it) => (
                <div key={it.key} className="flex shrink-0 items-baseline gap-x-1">
                    <dt className={cnSectionBlockTitle()}>{it.key}:</dt>
                    <dd className="whitespace-nowrap text-[12px] font-medium leading-[1.5] text-foreground">
                        {it.value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export function OrderExecutionFilters({
    machineOptions,
    isMachineOptionsLoading,
    selectedMachine,
    onMachineChange,
    jobInfo,
    progressInfo,
}: OrderExecutionFiltersProps) {
    const [collapsed, setCollapsed] = useState(false);
    const stripItems: JobInfoItem[] = [...(jobInfo ?? []), ...(progressInfo ?? [])];
    const hasStrip = stripItems.length > 0;

    const toggleButton = (
        <Button
            variant="ghost"
            size="icon"
            type="button"
            className="shrink-0"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Развернуть фильтр" : "Свернуть фильтр"}
            aria-expanded={!collapsed}
        >
            ☰
        </Button>
    );

    if (collapsed) {
        return (
            <Card className="shrink-0 gap-0 py-0 shadow-sm">
                <div className="flex min-w-0 items-center gap-2 px-3 py-2">
                    {hasStrip ? (
                        <OrderExecutionJobInfoStrip items={stripItems} />
                    ) : (
                        <span className="min-w-0 flex-1 text-[12px] text-muted-foreground">Фильтр свёрнут</span>
                    )}
                    {toggleButton}
                </div>
            </Card>
        );
    }

    return (
        <Card className="shrink-0 gap-0 py-0 shadow-sm">
            <CardHeader className="gap-0 space-y-0 px-4 pt-3">
                <CardTitle className={cnSectionBlockTitle()}>Исполнение заказа</CardTitle>
                <CardAction>{toggleButton}</CardAction>
            </CardHeader>

            <CardContent className="px-4 pb-3 pt-0">
                <div className="grid w-fit max-w-full gap-1.5">
                    <Label htmlFor="order-execution-machine" className={comboboxFieldLabelClassName}>
                        Машина
                    </Label>
                    <select
                        id="order-execution-machine"
                        value={selectedMachine ?? ""}
                        disabled={isMachineOptionsLoading || machineOptions.length === 0}
                        onChange={(event) => onMachineChange(event.target.value)}
                        className="h-9 w-fit min-w-[8.5rem] max-w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isMachineOptionsLoading ? (
                            <option value="">Загрузка…</option>
                        ) : machineOptions.length === 0 ? (
                            <option value="">Нет машин</option>
                        ) : null}
                        {machineOptions.map((item) => (
                            <option key={item.resourceCode} value={item.resourceCode}>
                                {item.machine}
                            </option>
                        ))}
                    </select>
                </div>
            </CardContent>

            {hasStrip && (
                <div className="border-t border-border px-4 pb-3 pt-3">
                    <OrderExecutionJobInfoStrip items={stripItems} />
                </div>
            )}
        </Card>
    );
}
