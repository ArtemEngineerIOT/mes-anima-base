import * as React from "react";

import { cn } from "@/shared/lib/css";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { Icon } from "@/shared/ui/kit/icon";
import { informerToneTokens, type InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";

export type InformerTablePanelProps = Omit<React.ComponentProps<"div">, "title"> & {
    tone?: InformerTone;
    title: React.ReactNode;
    /** По умолчанию — иконка тона из `informerToneTokens` */
    iconName?: string;
    /** Левая цветовая полоса с иконкой. По умолчанию `true`. */
    showToneBar?: boolean;
    /** Кнопки / действия под таблицей */
    footer?: React.ReactNode;
    children: React.ReactNode;
};

export function InformerTablePanel({
    tone = "success",
    title,
    iconName,
    showToneBar = true,
    footer,
    children,
    className,
    ...props
}: InformerTablePanelProps) {
    const tokens = informerToneTokens[tone];

    return (
        <div
            className={cn(
                "flex min-h-0 overflow-hidden rounded-sm border border-border bg-background shadow-sm",
                className,
            )}
            {...props}
        >
            {showToneBar ? (
                <div
                    className={cn("flex w-11 shrink-0 flex-col items-center pt-4", tokens.bar)}
                    aria-hidden
                >
                    <Icon name={iconName ?? tokens.icon} size="sm" className="text-white" />
                </div>
            ) : null}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="shrink-0 border-b border-border bg-muted/40 px-4 py-3">
                    <div className={cnSectionBlockTitle()}>{title}</div>
                </div>
                <div className="min-h-0 flex-1 app-scroll overflow-auto py-3">{children}</div>
                {footer ? (
                    <div className="shrink-0 border-t border-border bg-muted/40 px-4 py-3">{footer}</div>
                ) : null}
            </div>
        </div>
    );
}
