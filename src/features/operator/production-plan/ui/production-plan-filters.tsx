import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

import { ALL_MACHINES_SELECT_VALUE, type ProductionPlanFilters, type ProductionPlanMachine } from "../model/types";

const selectClassName =
    "h-9 w-full min-w-[8.5rem] rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function toMachineSelectValue(resourceCode: string | null): string {
    return resourceCode ?? ALL_MACHINES_SELECT_VALUE;
}

type ProductionPlanFiltersProps = {
    filters: ProductionPlanFilters;
    machineOptions: ProductionPlanMachine[];
    isMachineOptionsLoading: boolean;
    searchQuery: string;
    isRefreshing: boolean;
    onFiltersChange: (patch: Partial<ProductionPlanFilters>) => void;
    onSearchQueryChange: (value: string) => void;
    onRefresh: () => void;
};

export function ProductionPlanFilters({
    filters,
    machineOptions,
    isMachineOptionsLoading,
    searchQuery,
    isRefreshing,
    onFiltersChange,
    onSearchQueryChange,
    onRefresh,
}: ProductionPlanFiltersProps) {
    const [machineSelectValue, setMachineSelectValue] = useState(() =>
        toMachineSelectValue(filters.resourceCode),
    );

    useEffect(() => {
        setMachineSelectValue(toMachineSelectValue(filters.resourceCode));
    }, [filters.resourceCode]);

    return (
        <div className="flex flex-col gap-3">
            <div className={cnSectionBlockTitle()}>Производственный план</div>

            <div className="flex flex-wrap items-end gap-4">
                <div className="grid gap-1.5">
                    <Label className={comboboxFieldLabelClassName}>Период</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(event) => onFiltersChange({ dateFrom: event.target.value })}
                            className="w-[10.5rem]"
                            aria-label="Дата начала периода"
                        />
                        <Input
                            type="date"
                            value={filters.dateTo}
                            onChange={(event) => onFiltersChange({ dateTo: event.target.value })}
                            className="w-[10.5rem]"
                            aria-label="Дата окончания периода"
                        />
                    </div>
                </div>

                <div className="grid w-[10.5rem] gap-1.5">
                    <Label htmlFor="production-plan-machine" className={comboboxFieldLabelClassName}>
                        Машина
                    </Label>
                    <select
                        id="production-plan-machine"
                        value={machineSelectValue}
                        disabled={isMachineOptionsLoading}
                        onChange={(event) => {
                            const value = event.target.value;
                            setMachineSelectValue(value);
                            onFiltersChange({
                                resourceCode:
                                    value === ALL_MACHINES_SELECT_VALUE ? null : value,
                            });
                        }}
                        className={selectClassName}
                    >
                        <option value={ALL_MACHINES_SELECT_VALUE}>
                            {isMachineOptionsLoading ? "Загрузка…" : "Все машины"}
                        </option>
                        {machineOptions.map((item) => (
                            <option key={item.resourceCode} value={item.resourceCode}>
                                {item.machine}
                            </option>
                        ))}
                    </select>
                </div>

                <Button type="button" onClick={onRefresh} disabled={isRefreshing}>
                    {isRefreshing ? "Загрузка…" : "Обновить"}
                </Button>
            </div>

            <div className="grid max-w-full gap-1.5">
                <Label htmlFor="production-plan-search" className={comboboxFieldLabelClassName}>
                    Поиск
                </Label>
                <div className="relative max-w-xl">
                    <Input
                        id="production-plan-search"
                        value={searchQuery}
                        onChange={(event) => onSearchQueryChange(event.target.value)}
                        placeholder="Поиск по таблице…"
                        className="pr-9"
                    />
                    <Search
                        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                    />
                </div>
            </div>
        </div>
    );
}
