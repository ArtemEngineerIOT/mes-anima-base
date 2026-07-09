import { cn } from "@/shared/lib/css";

import type { EventRegistrationStep } from "../../../model/event-registration/types";

const STEPS: { step: EventRegistrationStep; label: string }[] = [
    { step: 1, label: "Регистрация события" },
    { step: 2, label: "Описание события" },
    { step: 3, label: "Подтверждение регистрации" },
];

type Props = {
    currentStep: EventRegistrationStep;
    onStepClick: (step: EventRegistrationStep) => void;
    disabled?: boolean;
};

export function EventRegistrationStepper({ currentStep, onStepClick, disabled }: Props) {
    return (
        <div className="flex border-b border-border">
            {STEPS.map((item) => {
                const completed = currentStep > item.step;
                const active = currentStep === item.step;
                const canNavigate = !disabled && item.step < currentStep;

                return (
                    <button
                        key={item.step}
                        type="button"
                        disabled={!canNavigate}
                        onClick={() => canNavigate && onStepClick(item.step)}
                        className={cn(
                            "min-w-0 flex-1 border-b-2 px-3 py-2 text-center text-[12px] font-medium transition-colors",
                            active
                                ? "border-primary text-primary"
                                : completed
                                  ? "border-transparent text-foreground hover:text-primary"
                                  : "border-transparent text-muted-foreground",
                            canNavigate ? "cursor-pointer" : "cursor-default",
                        )}
                    >
                        {item.step} {item.label}
                    </button>
                );
            })}
        </div>
    );
}
