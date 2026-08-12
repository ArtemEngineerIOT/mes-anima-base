import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/css";
import {
    TRANSIENT_INFORMER_FADE_MS,
    TRANSIENT_INFORMER_VISIBLE_MS,
} from "@/shared/ui/kit/auto-dismiss-informer";

export type AutoDismissMessageTone = "success" | "alert";

export type AutoDismissMessageProps = {
    message: string;
    tone?: AutoDismissMessageTone;
    /** Сброс сообщения в состоянии после fade-out */
    onDismiss: () => void;
    className?: string;
};

const toneClassName: Record<AutoDismissMessageTone, string> = {
    success: "text-foreground",
    alert: "text-destructive",
};

/**
 * Всплывающая текстовая надпись: показывается, затем fade-out и `onDismiss`.
 * Тайминги — {@link TRANSIENT_INFORMER_VISIBLE_MS} / {@link TRANSIENT_INFORMER_FADE_MS}.
 * Чтобы повторно показать тот же текст, задайте новый `key` у компонента.
 */
export function AutoDismissMessage({
    message,
    tone = "alert",
    onDismiss,
    className,
}: AutoDismissMessageProps) {
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
    }, [message]);

    return (
        <p
            className={cn(
                "w-full text-[12px] leading-4 transition-opacity ease-out",
                toneClassName[tone],
                opaque ? "opacity-100" : "opacity-0",
                className,
            )}
            style={{ transitionDuration: `${TRANSIENT_INFORMER_FADE_MS}ms` }}
            aria-live="polite"
        >
            {message}
        </p>
    );
}
