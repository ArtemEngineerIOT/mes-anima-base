import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { cn } from "@/shared/lib/css";
import { getNotificationBellInformerClasses } from "@/shared/lib/notification-bell-informer-styles";
import { useTheme } from "@/shared/lib/theme";
import { ROUTES } from "@/shared/model/routes";
import { ShiftHandoverDialog } from "@/features/shift-handover";
import { useSession } from "@/shared/model/session";
import { useSystemNotifications } from "@/shared/model/system-notifications";
import { Button } from "@/shared/ui/kit/button";
import { Icon } from "@/shared/ui/kit/icon";

function formatNotificationBadge(count: number) {
    if (count < 1) return null;
    if (count > 99) return "99+";
    return String(count);
}

export function AppHeader({ onOpenNotifications }: { onOpenNotifications: () => void }) {
    const { session, logout } = useSession();
    const { headerNotifications } = useSystemNotifications();
    const { theme, toggleTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);
    const [shiftHandoverOpen, setShiftHandoverOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!menuOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            const el = menuRef.current;
            if (!el) return;
            if (e.target instanceof Node && !el.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        window.addEventListener("pointerdown", onPointerDown);
        return () => window.removeEventListener("pointerdown", onPointerDown);
    }, [menuOpen]);

    if (!session) {
        return null;
    }

    const notificationBadgeLabel = formatNotificationBadge(headerNotifications.count);
    const bellStyles = getNotificationBellInformerClasses(headerNotifications.bellTone);
    const displayName = session.mesProfile?.fio?.trim() || session.sub;
    const displayPosition = session.mesProfile?.position?.trim();

    return (
        <header className="min-w-0 rounded-sm border bg-background px-4 py-3 shadow-sm">
            <ShiftHandoverDialog open={shiftHandoverOpen} onOpenChange={setShiftHandoverOpen} />
            <div className="flex items-center justify-between">
                {session ? (
                    <div className="ml-auto flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={toggleTheme}
                            aria-label="toggle theme"
                            title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
                        >
                            <Icon name={theme === "dark" ? "light_mode" : "dark_mode"} size="md" />
                        </Button>

                        <div ref={menuRef} className="relative">
                            <button
                                type="button"
                                className={cn(
                                    "flex items-center gap-2 rounded-sm px-2 py-1 hover:bg-accent",
                                    menuOpen && "bg-accent",
                                )}
                                onClick={() => setMenuOpen((v) => !v)}
                            >
                                <img src="/assets/avatar.svg" alt="" className="h-6 w-6 rounded-full" aria-hidden />
                                <span className="flex min-w-0 flex-col items-start text-left">
                                    <span className="truncate text-sm font-medium text-foreground">{displayName}</span>
                                    {displayPosition ? (
                                        <span className="truncate text-xs text-muted-foreground">{displayPosition}</span>
                                    ) : null}
                                </span>
                                <Icon name="expand_more" className="shrink-0 text-muted-foreground" size="md" />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-[220px] rounded-sm border bg-background shadow-lg">
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            setShiftHandoverOpen(true);
                                        }}
                                    >
                                        Передача смены
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            logout();
                                            navigate(ROUTES.LOGIN, { replace: true });
                                        }}
                                    >
                                        Выйти
                                    </button>
                                </div>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={onOpenNotifications}
                            aria-label={
                                headerNotifications.count > 0
                                    ? `Уведомления, непрочитанных: ${headerNotifications.count}`
                                    : "Уведомления"
                            }
                            title={
                                headerNotifications.count > 0
                                    ? `Уведомления (${headerNotifications.count})`
                                    : "Уведомления"
                            }
                            className="relative"
                        >
                            <Icon
                                name="notifications"
                                size="md"
                                className={bellStyles.iconClass}
                            />
                            {notificationBadgeLabel && bellStyles.badgeClass ? (
                                <span
                                    className={cn(
                                        "absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none",
                                        bellStyles.badgeClass,
                                    )}
                                >
                                    {notificationBadgeLabel}
                                </span>
                            ) : null}
                        </Button>
                    </div>
                ) : null}
            </div>
        </header>
    );
}
