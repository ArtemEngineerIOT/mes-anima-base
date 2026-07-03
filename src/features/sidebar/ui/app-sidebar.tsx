import { hasRoleAccess, normalizeRole } from "@/shared/model/roles";
import { NAVIGATION } from "@/shared/model/navigation";
import { cn } from "@/shared/lib/css";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/shared/ui/kit/button";

export function AppSidebar({
    collapsed,
    onToggle,
    role,
}: {
    collapsed: boolean;
    onToggle: () => void;
    role: string | null | undefined;
}) {
    const location = useLocation();
    const userRole = normalizeRole(role);

    return (
        <aside
            className={cn(
                "flex h-full min-h-0 shrink-0 flex-col rounded-sm border bg-background shadow-sm",
                collapsed ? "w-[60px]" : "w-[250px]",
            )}
        >
            <div
                className={cn(
                    "px-3 py-3",
                    collapsed ? "flex flex-col items-center gap-2" : "flex items-center justify-between",
                )}
            >
                <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
                    <img
                        src="/assets/logoMenu.svg"
                        alt="MES"
                        className={cn("shrink-0", collapsed ? "h-7 w-7" : "h-8 w-8")}
                    />
                </div>
                <Button variant="ghost" size="icon" onClick={onToggle} aria-label="toggle sidebar">
                    ☰
                </Button>
            </div>

            <nav className={cn("app-scroll px-2 pb-3 flex-1 min-h-0 overflow-auto", collapsed && "hidden")}>
                {NAVIGATION.map((group) => {
                    const visibleItems = group.items.filter((i) => hasRoleAccess(userRole, i.roles));
                    if (visibleItems.length === 0) return null;

                    const activeInGroup = visibleItems.some((i) => location.pathname === i.to);

                    return (
                        <div key={group.id} className="mb-4">
                            {!collapsed && (
                                <div
                                    className={cn(
                                        "px-2 py-2 text-[14px] font-semibold uppercase tracking-wide",
                                        activeInGroup ? "text-primary" : "text-foreground",
                                    )}
                                >
                                    {group.label}
                                </div>
                            )}
                            <div className={cn("relative flex flex-col gap-3 pl-3", !collapsed && "ml-3")}>
                                {!collapsed && (
                                    <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-px bg-[rgba(0,65,102,0.2)]" />
                                )}
                                {visibleItems.map((item) => {
                                    const active = location.pathname === item.to;
                                    return (
                                        <Link
                                            key={item.id}
                                            to={item.to}
                                            className={cn(
                                                "text-[13px] leading-4 transition-colors",
                                                active ? "text-primary" : "text-foreground/60 hover:text-primary",
                                            )}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}

