import * as React from "react";

import { cn } from "@/shared/lib/css";
import { informerToneTokens, type InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";

export type InformerPillVariant = "outline" | "filled";

export type InformerPillProps = React.ComponentProps<"span"> & {
    tone: InformerTone;
    variant?: InformerPillVariant;
};

export function InformerPill({
    tone,
    variant = "outline",
    className,
    children,
    ...props
}: InformerPillProps) {
    const tokens = informerToneTokens[tone];
    const surface = variant === "filled" ? tokens.filled : tokens.pill;
    return (
        <span
            className={cn(
                "inline-flex max-w-full items-center rounded-sm px-2 py-1 text-[11px] font-semibold leading-tight",
                surface,
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}
