import { cn } from "@/shared/lib/css";
import { Icon } from "@/shared/ui/kit/icon";

import type { EventRegistrationStep } from "../../../model/event-registration/types";

const STEPS: { step: EventRegistrationStep; label: string }[] = [
    { step: 1, label: "Код события" },
    { step: 2, label: "Данные события" },
    { step: 3, label: "Подтверждение" },
];

type Props = {
    currentStep: EventRegistrationStep;
    onStepClick: (step: EventRegistrationStep) => void;
};

export function EventRegistrationStepper({ currentStep, onStepClick }: Props) {
    return (
        <div className="flex items-center gap-2">
            {STEPS.map((item, index) => {
                const completed = currentStep > item.step;
                const active = currentStep === item.step;
                const canNavigate = item.step < currentStep;

                return (
                    <div key={item.step} className="flex min-w-0 flex-1 items-center gap-2 last:flex-none">
                        <button
                            type="button"
                            disabled={!canNavigate}
                            onClick={() => canNavigate && onStepClick(item.step)}
                            className={cn(
                                "flex min-w-0 items-center gap-2 text-left",
                                canNavigate ? "cursor-pointer" : "cursor-default",
                            )}
                        >
                            <span
                                className={cn(
                                    "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                                    completed && "border-primary bg-primary text-primary-foreground",
                                    active && !completed && "border-primary text-primary",
                                    !active && !completed && "border-border text-muted-foreground",
                                )}
                            >
                                {completed ? <Icon name="check" size="sm" /> : item.step}
                            </span>
                            <span
                                className={cn(
                                    "truncate text-[12px] font-medium",
                                    active ? "text-foreground" : "text-muted-foreground",
                                )}
                            >
                                {item.label}
                            </span>
                        </button>
                        {index < STEPS.length - 1 ? (
                            <div
                                className={cn(
                                    "hidden h-px min-w-4 flex-1 sm:block",
                                    completed ? "bg-primary" : "bg-border",
                                )}
                            />
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
