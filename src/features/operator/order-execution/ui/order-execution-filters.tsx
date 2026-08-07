import { cn } from "@/shared/lib/css";
import { Card } from "@/shared/ui/kit/card";
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
    /** План / выпуск / остаток (getProgress); «Прогресс» в шапке не показываем */
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
                "app-scroll flex min-w-0 flex-1 flex-nowrap items-center gap-x-6 overflow-x-auto",
                className,
            )}
        >
            {items.map((it) => (
                <div key={it.key} className="flex shrink-0 items-center gap-x-1">
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
    const stripItems: JobInfoItem[] = [
        ...(jobInfo ?? []),
        ...(progressInfo ?? []).filter((item) => item.key !== "Прогресс"),
    ];
    const hasStrip = stripItems.length > 0;

    return (
        <Card className="shrink-0 gap-0 py-0 shadow-sm">
            <div className="flex min-w-0 items-end gap-3 px-3 py-1.5">
                <div className="grid w-fit max-w-full shrink-0 gap-0.5 border-r border-border pr-3">
                    <Label
                        htmlFor="order-execution-machine"
                        className={cn(comboboxFieldLabelClassName, "text-[11px] leading-[1.4]")}
                    >
                        Выбор машины
                    </Label>
                    <select
                        id="order-execution-machine"
                        value={selectedMachine ?? ""}
                        disabled={isMachineOptionsLoading || machineOptions.length === 0}
                        onChange={(event) => onMachineChange(event.target.value)}
                        className="h-7 w-fit min-w-[8.5rem] max-w-full rounded-sm border border-input bg-background px-2 text-[12px] leading-[1.5] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
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

                {hasStrip ? (
                    <OrderExecutionJobInfoStrip items={stripItems} />
                ) : (
                    <span className="min-w-0 flex-1 text-[12px] text-muted-foreground">Исполнение заказа</span>
                )}
            </div>
        </Card>
    );
}
