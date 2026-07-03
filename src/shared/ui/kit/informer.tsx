import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/css";
import { Icon } from "@/shared/ui/kit/icon";
import { informerToneTokens, type InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";

export type { InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";

const informerVariants = cva("rounded-sm flex gap-3", {
    variants: {
        tone: {
            success: "",
            warning: "",
            alert: "",
            system: "",
            normal: "",
        },
        variant: {
            filled: "p-3",
            bordered: "p-3",
            outline: "p-3 border",
        },
        size: {
            m: "",
            s: "p-2 text-[12px]",
        },
    },
    defaultVariants: {
        tone: "normal",
        variant: "bordered",
        size: "m",
    },
});

export type InformerProps = React.ComponentProps<"div"> &
    Omit<VariantProps<typeof informerVariants>, "tone" | "variant" | "size"> & {
        tone?: InformerTone;
        variant?: "filled" | "bordered" | "outline";
        size?: "m" | "s";
        title: React.ReactNode;
        description?: React.ReactNode;
        iconName?: string;
    };

export function Informer({
    className,
    tone = "normal",
    variant = "bordered",
    size = "m",
    title,
    description,
    iconName,
    ...props
}: InformerProps) {
    const toneKey: InformerTone = tone ?? "normal";
    const tokens = informerToneTokens[toneKey];
    const isFilled = variant === "filled";

    const shellClass =
        variant === "filled"
            ? tokens.filled
            : variant === "outline"
              ? tokens.outline
              : tokens.bordered;

    /** Bordered не задаёт цвет текста на корне — без этого возможно наследование светлого цвета от родителя. */
    const borderedReadableText = variant === "bordered" && !isFilled ? "text-card-foreground" : null;

    return (
        <div
            className={cn(informerVariants({ tone, variant, size }), shellClass, borderedReadableText, className)}
            {...props}
        >
            {!isFilled && <div className={cn("w-1 self-stretch rounded-sm", tokens.bar)} />}
            <Icon
                name={iconName ?? tokens.icon}
                size="md"
                className={cn(
                    isFilled ? tokens.filledTitleAndIcon : tokens.iconClass,
                    "mt-[1px] shrink-0",
                )}
            />
            <div className="min-w-0">
                <div
                    className={cn(
                        "text-[12px] font-bold leading-4",
                        isFilled ? tokens.filledTitleAndIcon : tokens.titleClass,
                    )}
                >
                    {title}
                </div>
                {description ? (
                    <div
                        className={cn(
                            "mt-1 text-[12px] leading-4",
                            isFilled ? tokens.filledDescription : tokens.descClass,
                        )}
                    >
                        {description}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export { informerVariants };

