import { ChevronDown } from "lucide-react";

import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";

import { PRODUCTION_PLAN_STAGE_STATUS_OPTIONS } from "../model/stage-status";
import type { StageStatus } from "../model/types";

type ProductionPlanStatusColumnHeadProps = {
    selectedStatuses: readonly StageStatus[];
    onToggleStatus: (status: StageStatus) => void;
    onClearStatuses: () => void;
};

export function ProductionPlanStatusColumnHead({
    selectedStatuses,
    onToggleStatus,
    onClearStatuses,
}: ProductionPlanStatusColumnHeadProps) {
    const isFiltered = selectedStatuses.length > 0;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                        "h-auto max-w-full gap-1 px-0 py-0 font-bold uppercase",
                        "hover:bg-transparent hover:text-foreground",
                        isFiltered && "text-primary",
                    )}
                    aria-label={
                        isFiltered
                            ? `Фильтр по статусу этапа: выбрано ${selectedStatuses.length}`
                            : "Фильтр по статусу этапа"
                    }
                >
                    <span className="truncate">Статус этапа</span>
                    <ChevronDown className="size-3.5 shrink-0 opacity-70" aria-hidden />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-52 p-0"
                onOpenAutoFocus={(event) => {
                    event.preventDefault();
                }}
            >
                <div className="max-h-60 overflow-y-auto p-1">
                    {PRODUCTION_PLAN_STAGE_STATUS_OPTIONS.map((option) => (
                        <label
                            key={option.value}
                            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm normal-case hover:bg-accent hover:text-accent-foreground"
                        >
                            <input
                                type="checkbox"
                                className="size-4 shrink-0 rounded border border-input accent-primary"
                                checked={selectedStatuses.includes(option.value)}
                                onChange={() => {
                                    onToggleStatus(option.value);
                                }}
                            />
                            <span className="select-none">{option.label}</span>
                        </label>
                    ))}
                </div>
                {isFiltered ? (
                    <div className="border-t border-border p-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-full justify-start font-normal normal-case"
                            onClick={onClearStatuses}
                        >
                            Сбросить фильтр
                        </Button>
                    </div>
                ) : null}
            </PopoverContent>
        </Popover>
    );
}
