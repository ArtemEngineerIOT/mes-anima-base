import { useEffect, useRef, useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { Icon } from "@/shared/ui/kit/icon";
import { cn } from "@/shared/lib/css";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { getInformerToneTokens, type InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";

export function OrderExecutionCollapsibleSection({
    title,
    defaultOpen = true,
    tone,
    count,
    updatedAt,
    updatedAtLabel = "Обновлено",
    keepMounted = false,
    onExpandedChange,
    children,
}: {
    title: string;
    defaultOpen?: boolean;
    /** Иконка и цвет счётчика как у `Informer` */
    tone?: InformerTone;
    /** Отображается отдельно от иконки, в тех же цветах что и иконка */
    count?: number;
    /** Время последнего обновления в правой части заголовка */
    updatedAt?: string | null;
    updatedAtLabel?: string;
    /** Не размонтировать содержимое при сворачивании — сохраняет ввод и состояние формы */
    keepMounted?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
    children: ReactNode;
}) {
    const [expanded, setExpanded] = useState(defaultOpen);
    const [mounted, setMounted] = useState(defaultOpen);
    const bodyRef = useRef<HTMLDivElement | null>(null);
    const [height, setHeight] = useState<number | "auto">(defaultOpen ? "auto" : 0);
    const [animating, setAnimating] = useState(false);

    // Keep height in sync when content changes while open.
    useEffect(() => {
        const el = bodyRef.current;
        if (!el) return;
        if (!expanded) return;

        const ro = new ResizeObserver(() => {
            if (height === "auto") return;
            setHeight(el.scrollHeight);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [expanded, height]);

    const toggle = () => {
        const el = bodyRef.current;
        if (!el) {
            setExpanded((value) => {
                const next = !value;
                onExpandedChange?.(next);
                return next;
            });
            setMounted((value) => !value);
            return;
        }

        setAnimating(true);

        if (expanded) {
            // Collapse: from current height -> 0
            const current = el.scrollHeight;
            setHeight(current);
            requestAnimationFrame(() => {
                setHeight(0);
            });
            setExpanded(false);
            onExpandedChange?.(false);
        } else {
            // Expand: from 0 -> content height, then set auto.
            setMounted(true);
            setExpanded(true);
            onExpandedChange?.(true);
            setHeight(0);
            requestAnimationFrame(() => {
                setHeight(el.scrollHeight);
            });
        }
    };

    const toneTokens = tone ? getInformerToneTokens(tone) : null;

    return (
        <Card className="py-0 gap-0">
            <CardHeader className="px-4 pt-2 pb-2 gap-0 border-b pb-2 shadow-[0_8px_12px_-12px_rgba(0,0,0,0.45)]">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        onClick={toggle}
                    >
                        <CardTitle className={cnSectionBlockTitle("min-w-0 truncate")}>{title}</CardTitle>
                        <Icon
                            name="expand_more"
                            size="md"
                            className={cn(
                                "shrink-0 text-muted-foreground transition-transform",
                                expanded ? "rotate-180" : "rotate-0",
                            )}
                        />
                    </button>
                    {toneTokens ? (
                        <div className="flex shrink-0 items-center gap-1.5">
                            <Icon
                                name={toneTokens.icon}
                                size="sm"
                                className={cn(toneTokens.iconClass, "mt-[1px]")}
                            />
                            {typeof count === "number" && count > 0 ? (
                                <span
                                    className={cn(
                                        "text-[12px] font-semibold tabular-nums leading-none",
                                        toneTokens.titleClass,
                                    )}
                                >
                                    {count}
                                </span>
                            ) : null}
                        </div>
                    ) : updatedAt?.trim() ? (
                        <span className="shrink-0 text-[12px] leading-none text-muted-foreground">
                            {updatedAtLabel}: {updatedAt.trim()}
                        </span>
                    ) : null}
                </div>
            </CardHeader>
            {mounted && (
                <div
                    className={cn(
                        "overflow-hidden transition-[height,opacity] duration-200 ease-out",
                        expanded ? "opacity-100" : "opacity-0",
                    )}
                    style={{ height: height === "auto" ? "auto" : `${height}px` }}
                    onTransitionEnd={(e) => {
                        if (e.propertyName !== "height") return;
                        setAnimating(false);
                        if (expanded) {
                            setHeight("auto");
                        } else if (!keepMounted) {
                            setMounted(false);
                        }
                    }}
                    aria-hidden={!expanded}
                >
                    <div ref={bodyRef}>
                        <CardContent className={cn("pb-4", animating && "pointer-events-none")}>
                            {children}
                        </CardContent>
                    </div>
                </div>
            )}
        </Card>
    );
}
