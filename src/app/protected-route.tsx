import { useEffect, useRef } from "react";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";
import { isWebSocketActive, useTestEventStompSubscription, webSocket } from "@/shared/api/websocket";
import { Navigate, Outlet } from "react-router";

export function ProtectedRoute() {
    const { session, token, isBootstrapLoading } = useSession();
    const initCalled = useRef(false);

    useTestEventStompSubscription({ enabled: Boolean(token) });

    useEffect(() => {
        if (token && !initCalled.current) {
            initCalled.current = true;
            if (!isWebSocketActive()) {
                webSocket.init();
            }
            return;
        }

        if (!token) {
            initCalled.current = false;
            webSocket.closeWebSocket();
        }
    }, [token]);

    if (isBootstrapLoading) {
        return null;
    }

    if (!session) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    return <Outlet />;
}