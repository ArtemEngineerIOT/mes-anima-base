import { useState } from "react";
import { Outlet, useLocation } from "react-router";

import { AppHeader } from "@/features/header";
import { NotificationsDrawer } from "@/features/notifications";
import { AppSidebar } from "@/features/sidebar";
import { cn } from "@/shared/lib/css";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";

export function App() {
    const location = useLocation();
    const { session, isBootstrapLoading } = useSession();
    const role = session?.role;
    const [collapsed, setCollapsed] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const isAuthPage = location.pathname === ROUTES.LOGIN || location.pathname === ROUTES.REGISTER;
    const showAppChrome = !isAuthPage && Boolean(session) && !isBootstrapLoading;
    const isOrderExecutionPage = location.pathname === ROUTES.OPERATOR.ORDER_EXECUTION;
    const isMaterialOrderPage = location.pathname === ROUTES.OPERATOR.MATERIAL_ORDER;
    const isMaterialMovePage = location.pathname === ROUTES.OPERATOR.MATERIAL_MOVE;
    const isProductionPlanPage = location.pathname === ROUTES.OPERATOR.PRODUCTION_PLAN;
    const isFullHeightPage =
        isOrderExecutionPage || isMaterialOrderPage || isMaterialMovePage || isProductionPlanPage;

    const productionPlanShellClassName =
        "flex-1 min-h-0 min-w-0 overflow-hidden rounded-sm border bg-background shadow-sm";

    return (
        <div className="box-border h-screen overflow-hidden bg-muted p-3">
            <div className={cn("h-full min-h-0 min-w-0", isAuthPage ? "flex" : "flex gap-3")}>
                {showAppChrome && (
                    <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} role={role} />
                )}

                <div className="flex min-w-0 flex-1 min-h-0 flex-col gap-3">
                    {showAppChrome && (
                        <AppHeader onOpenNotifications={() => setNotificationsOpen(true)} />
                    )}
                    {isProductionPlanPage ? (
                        <div className={productionPlanShellClassName}>
                            <Outlet />
                        </div>
                    ) : isFullHeightPage ? (
                        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                            <Outlet />
                        </div>
                    ) : (
                        <main className="app-scroll min-h-0 min-w-0 flex-1 overflow-auto rounded-sm border bg-background p-4 shadow-sm">
                            <Outlet />
                        </main>
                    )}
                </div>
            </div>

            {showAppChrome && (
                <NotificationsDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
            )}
        </div>
    );
}
