import { useEffect } from "react";
import { cn } from "@/shared/lib/css";
import { useSystemNotifications } from "@/shared/model/system-notifications";
import { Button } from "@/shared/ui/kit/button";
import { Informer } from "@/shared/ui/kit/informer";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

export function NotificationsDrawer({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const { oneCServiceUnavailable, generalUnreadCount } = useSystemNotifications();
    const hasSystemPanel = oneCServiceUnavailable;
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    return (
        <div className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")}>
            <div
                className={cn(
                    "absolute inset-0 bg-black/30 transition-opacity",
                    open ? "opacity-100" : "opacity-0",
                )}
                onClick={onClose}
            />
            <aside
                className={cn(
                    "absolute right-0 top-0 h-full w-[360px] max-w-[90vw] border-l bg-background shadow-xl transition-transform",
                    open ? "translate-x-0" : "translate-x-full",
                )}
            >
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="text-sm font-semibold">Уведомления</div>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Закрыть
                    </Button>
                </div>
                <div className="app-scroll flex h-[calc(100%-52px)] flex-col gap-6 overflow-auto p-4 text-sm">
                    {hasSystemPanel ? (
                        <section className="flex flex-col gap-2">
                            <div className={cnSectionBlockTitle("text-muted-foreground")}>Системные</div>
                            <Informer
                                tone="alert"
                                variant="filled"
                                size="s"
                                title="Внимание. Сервис 1С недоступен"
                                description="Повторите попытку позже или сообщите начальнику смены / в IT."
                            />
                        </section>
                    ) : null}

                    <section className="flex flex-col gap-2">
                        <div className={cnSectionBlockTitle("text-muted-foreground")}>Общие</div>
                        <p className="text-muted-foreground">
                            {generalUnreadCount > 0
                                ? `Непрочитанных в ленте: ${generalUnreadCount}.`
                                : "Пока нет уведомлений."}
                        </p>
                    </section>
                </div>
            </aside>
        </div>
    );
}

