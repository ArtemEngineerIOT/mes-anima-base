import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
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
    isContentReady = true,
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
    /**
     * Пока `false`, содержимое не рисуется — чтобы при раскрытии не мелькали пустые таблицы и нули.
     */
    isContentReady?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
    children: ReactNode;
}) {
    const [expanded, setExpanded] = useState(defaultOpen);
    const [mounted, setMounted] = useState(defaultOpen);
    const bodyRef = useRef<HTMLDivElement | null>(null);
    const [height, setHeight] = useState<number | "auto">(defaultOpen ? "auto" : 0);
    const [animating, setAnimating] = useState(false);

    useLayoutEffect(() => {
        if (!expanded || !mounted) {
            return;
        }

        const el = bodyRef.current;
        if (!el) {
            return;
        }

        if (height === "auto") {
            return;
        }

        const nextHeight = el.scrollHeight;
        if (nextHeight !== height) {
            setHeight(nextHeight);
        }
    }, [expanded, mounted, height, isContentReady]);

    useEffect(() => {
        const el = bodyRef.current;
        if (!el || !expanded) {
            return;
        }

        const observer = new ResizeObserver(() => {
            setHeight((current) => {
                if (current === "auto") {
                    return current;
                }
                const nextHeight = el.scrollHeight;
                return nextHeight === current ? current : nextHeight;
            });
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [expanded, mounted]);

    const toggle = () => {
        if (expanded) {
            const el = bodyRef.current;
            setAnimating(true);
            if (el) {
                setHeight(el.scrollHeight);
            }
            setExpanded(false);
            onExpandedChange?.(false);
            requestAnimationFrame(() => {
                setHeight(0);
            });
            return;
        }

        setAnimating(true);
        setMounted(true);
        setExpanded(true);
        onExpandedChange?.(true);
        setHeight(0);
    };

    const toneTokens = tone ? getInformerToneTokens(tone) : null;

    return (
        <Card className="py-0 gap-0">
            <CardHeader className="items-center px-4 py-2 gap-0 border-b shadow-[0_8px_12px_-12px_rgba(0,0,0,0.45)]">
                <div className="flex w-full items-center gap-2">
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
                                "shrink-0 leading-none text-muted-foreground transition-transform",
                                expanded ? "rotate-180" : "rotate-0",
                            )}
                        />
                    </button>
                    {updatedAt?.trim() || toneTokens || (typeof count === "number" && count > 0) ? (
                        <div className="flex shrink-0 items-center gap-1.5">
                            {updatedAt?.trim() ? (
                                <span className="text-[12px] leading-[1.4] text-muted-foreground">
                                    {updatedAtLabel}: {updatedAt.trim()}
                                </span>
                            ) : null}
                            {toneTokens ? (
                                <>
                                    <Icon
                                        name={toneTokens.icon}
                                        size="sm"
                                        className={cn(toneTokens.iconClass, "leading-none")}
                                    />
                                    {typeof count === "number" && count > 0 ? (
                                        <span
                                            className={cn(
                                                "text-[12px] font-semibold tabular-nums leading-[1.4]",
                                                toneTokens.titleClass,
                                            )}
                                        >
                                            {count}
                                        </span>
                                    ) : null}
                                </>
                            ) : typeof count === "number" && count > 0 ? (
                                <span className="shrink-0 text-[12px] font-semibold tabular-nums leading-[1.4] text-muted-foreground">
                                    {count}
                                </span>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </CardHeader>
            {mounted && (
                <div
                    className={cn(
                        "overflow-hidden transition-[height] duration-200 ease-out [overflow-anchor:none]",
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
                            {isContentReady ? children : null}
                        </CardContent>
                    </div>
                </div>
            )}
        </Card>
    );
}
