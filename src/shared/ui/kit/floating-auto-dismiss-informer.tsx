import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/lib/css";
import {
    TRANSIENT_INFORMER_FADE_MS,
    TRANSIENT_INFORMER_VISIBLE_MS,
} from "@/shared/ui/kit/auto-dismiss-informer";
import { Button } from "@/shared/ui/kit/button";
import { Icon } from "@/shared/ui/kit/icon";
import { Informer, type InformerProps } from "@/shared/ui/kit/informer";

const FLOATING_SNACKBAR_ROOT_ID = "floating-snackbar-root";

function ensureFloatingSnackbarRoot(): HTMLElement {
    const existing = document.getElementById(FLOATING_SNACKBAR_ROOT_ID);
    if (existing) {
        return existing;
    }

    const root = document.createElement("div");
    root.id = FLOATING_SNACKBAR_ROOT_ID;
    // flex-col-reverse: новые снекбары встают над уже показанными (снизу вверх).
    root.className =
        "pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(calc(100vw-2rem),24rem)] flex-col-reverse gap-2";
    document.body.appendChild(root);
    return root;
}

export type FloatingAutoDismissInformerProps = Omit<InformerProps, "children"> & {
    /** Сброс сообщения в состоянии после fade-out или закрытия крестиком */
    onDismiss: () => void;
};

/**
 * Всплывающий `Informer` поверх интерфейса (правый нижний угол), с автоскрытием и крестиком.
 * Несколько снекбаров складываются снизу вверх (новый — над предыдущим).
 * Тайминги — {@link TRANSIENT_INFORMER_VISIBLE_MS} / {@link TRANSIENT_INFORMER_FADE_MS}.
 * Чтобы повторно показать тот же текст, задайте новый `key` у компонента.
 */
export function FloatingAutoDismissInformer({
    onDismiss,
    className,
    title,
    description,
    ...informerProps
}: FloatingAutoDismissInformerProps) {
    const [opaque, setOpaque] = useState(true);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
    const onDismissRef = useRef(onDismiss);
    onDismissRef.current = onDismiss;
    const dismissedRef = useRef(false);

    useEffect(() => {
        setPortalRoot(ensureFloatingSnackbarRoot());
    }, []);

    const dismissNow = () => {
        if (dismissedRef.current) {
            return;
        }
        dismissedRef.current = true;
        setOpaque(false);
        window.setTimeout(() => {
            onDismissRef.current();
        }, TRANSIENT_INFORMER_FADE_MS);
    };

    useEffect(() => {
        dismissedRef.current = false;
        setOpaque(true);

        const fadeTimer = window.setTimeout(() => {
            setOpaque(false);
        }, TRANSIENT_INFORMER_VISIBLE_MS);

        const dismissTimer = window.setTimeout(() => {
            if (dismissedRef.current) {
                return;
            }
            dismissedRef.current = true;
            onDismissRef.current();
        }, TRANSIENT_INFORMER_VISIBLE_MS + TRANSIENT_INFORMER_FADE_MS);

        return () => {
            window.clearTimeout(fadeTimer);
            window.clearTimeout(dismissTimer);
        };
    }, [title, description]);

    if (!portalRoot) {
        return null;
    }

    return createPortal(
        <div
            className={cn(
                "pointer-events-auto w-full transition-opacity ease-out",
                opaque ? "opacity-100" : "opacity-0",
            )}
            style={{ transitionDuration: `${TRANSIENT_INFORMER_FADE_MS}ms` }}
            role="status"
            aria-live="polite"
        >
            <div className="relative shadow-lg">
                <Informer
                    {...informerProps}
                    title={title}
                    description={description}
                    className={cn("pr-10", className)}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1 right-1 size-7 text-muted-foreground hover:text-foreground"
                    aria-label="Закрыть"
                    onClick={dismissNow}
                >
                    <Icon name="close" size="sm" />
                </Button>
            </div>
        </div>,
        portalRoot,
    );
}
