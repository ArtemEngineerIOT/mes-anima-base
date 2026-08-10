import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/css";
import { Informer, type InformerProps } from "@/shared/ui/kit/informer";

/** Сколько держать всплывающий информер до начала fade-out (единое для всех таких плашек). */
export const TRANSIENT_INFORMER_VISIBLE_MS = 4000;

/** Длительность плавного исчезновения всплывающего информера. */
export const TRANSIENT_INFORMER_FADE_MS = 300;

export type AutoDismissInformerProps = Omit<InformerProps, "children"> & {
    /** Сброс сообщения в состоянии после fade-out */
    onDismiss: () => void;
};

/**
 * Всплывающий `Informer`: показывается, затем fade-out и `onDismiss`.
 * Тайминги — {@link TRANSIENT_INFORMER_VISIBLE_MS} / {@link TRANSIENT_INFORMER_FADE_MS}.
 * Чтобы повторно показать тот же текст, задайте новый `key` у компонента.
 */
export function AutoDismissInformer({
    onDismiss,
    className,
    title,
    description,
    ...informerProps
}: AutoDismissInformerProps) {
    const [opaque, setOpaque] = useState(true);
    const onDismissRef = useRef(onDismiss);
    onDismissRef.current = onDismiss;

    useEffect(() => {
        setOpaque(true);

        const fadeTimer = window.setTimeout(() => {
            setOpaque(false);
        }, TRANSIENT_INFORMER_VISIBLE_MS);

        const dismissTimer = window.setTimeout(() => {
            onDismissRef.current();
        }, TRANSIENT_INFORMER_VISIBLE_MS + TRANSIENT_INFORMER_FADE_MS);

        return () => {
            window.clearTimeout(fadeTimer);
            window.clearTimeout(dismissTimer);
        };
    }, [title, description]);

    return (
        <Informer
            {...informerProps}
            title={title}
            description={description}
            className={cn(
                "w-full transition-opacity ease-out",
                opaque ? "opacity-100" : "opacity-0",
                className,
            )}
            style={{
                ...informerProps.style,
                transitionDuration: `${TRANSIENT_INFORMER_FADE_MS}ms`,
            }}
        />
    );
}
