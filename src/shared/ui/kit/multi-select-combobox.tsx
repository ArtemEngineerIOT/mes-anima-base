import { useId, useMemo } from "react";
import { ChevronDown, X } from "lucide-react";

import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import { Label } from "@/shared/ui/kit/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";

export type MultiSelectComboboxProps<T extends string> = {
    fieldLabel: string;
    options: readonly { value: T; label: string }[];
    selected: readonly T[];
    onToggle: (value: T) => void;
    onClear?: () => void;
    clearAriaLabel?: string;
    placeholder?: string;
    className?: string;
};

export function MultiSelectCombobox<T extends string>({
    fieldLabel,
    options,
    selected,
    onToggle,
    onClear,
    clearAriaLabel = "Снять выделение",
    placeholder = "Выберите…",
    className,
}: MultiSelectComboboxProps<T>) {
    const triggerId = useId();

    const summary = useMemo(() => {
        if (selected.length === 0) {
            return placeholder;
        }
        const labels = selected.map((v) => options.find((o) => o.value === v)?.label ?? v);
        return labels.join(", ");
    }, [options, placeholder, selected]);

    return (
        <Popover>
            <div className={cn("flex min-w-0 flex-col gap-2", className)}>
                <Label htmlFor={triggerId} className={comboboxFieldLabelClassName}>
                    {fieldLabel}
                </Label>
                <div className="flex min-w-0 gap-1">
                    <PopoverTrigger asChild>
                        <Button
                            id={triggerId}
                            type="button"
                            variant="outline"
                            className="h-9 min-w-0 flex-1 justify-between gap-2 px-3 font-normal"
                        >
                            <span className="min-w-0 truncate text-left">{summary}</span>
                            <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
                        </Button>
                    </PopoverTrigger>
                    {onClear && selected.length > 0 ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="shrink-0"
                            aria-label={clearAriaLabel}
                            onClick={(e) => {
                                e.preventDefault();
                                onClear();
                            }}
                        >
                            <X className="size-4" aria-hidden />
                        </Button>
                    ) : null}
                </div>
                <PopoverContent
                    align="start"
                    className="p-0"
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                    }}
                >
                    <div className="max-h-60 overflow-y-auto p-1">
                        {options.map((opt) => (
                            <label
                                key={opt.value}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                                <input
                                    type="checkbox"
                                    className="size-4 shrink-0 rounded border border-input accent-primary"
                                    checked={selected.includes(opt.value)}
                                    onChange={() => {
                                        onToggle(opt.value);
                                    }}
                                />
                                <span className="select-none">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </PopoverContent>
            </div>
        </Popover>
    );
}
