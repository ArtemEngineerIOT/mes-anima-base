import { useEffect } from "react";

import { isAuthTokenExpired } from "@/shared/model/auth-token";
import { useSession } from "@/shared/model/session";

const TOKEN_EXPIRY_CHECK_INTERVAL_MS = 30_000;

/** Гидратация bootstrap MES с бэка после F5 и синхронизация токена с LS. */
export function SessionBootstrap() {
    const { token, mesBootstrap, logout, refreshBootstrap, syncWithStorage } = useSession();

    useEffect(() => {
        syncWithStorage();
    }, [syncWithStorage, token]);

    useEffect(() => {
        if (!token) {
            return;
        }

        if (isAuthTokenExpired(token)) {
            logout();
            return;
        }

        if (mesBootstrap !== undefined) {
            return;
        }

        void refreshBootstrap();
    }, [token, mesBootstrap, logout, refreshBootstrap]);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            const state = useSession.getState();
            state.syncWithStorage();
            if (state.token && isAuthTokenExpired(state.token)) {
                state.logout();
            }
        }, TOKEN_EXPIRY_CHECK_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, []);

    return null;
}
