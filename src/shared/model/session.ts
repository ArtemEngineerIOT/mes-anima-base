import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { createGStore } from "create-gstore";

import { queryClient } from "@/shared/api/query-client";
import type { ClientEnvironment } from "@/shared/lib/client-environment";
import type { MesBootstrap, MesBootstrapProfile } from "@/shared/lib/mes-user-profile";
import { clearStoredAuth, setStoredAuthToken } from "@/shared/model/auth-storage";
import { isAuthTokenExpired, readValidStoredAuthToken } from "@/shared/model/auth-token";
import { resolveClientEnvironmentFromBackend } from "@/shared/model/resolve-client-environment";
import { resolveMesUserProfileFromBackend, SessionRoleError } from "@/shared/model/resolve-mes-user-profile";
import type { Role } from "./roles";

export { SessionRoleError } from "@/shared/model/resolve-mes-user-profile";
export type { ClientEnvironment } from "@/shared/lib/client-environment";
export type { MesBootstrap, MesBootstrapProfile } from "@/shared/lib/mes-user-profile";

type JwtPayload = {
    sub: string;
    aud: string;
    exp: number;
    iat: number;
    jti?: string;
};

export type Session = JwtPayload & {
    mesBootstrap?: MesBootstrap;
    clientEnvironment?: ClientEnvironment;
    /** Производное: mesBootstrap.access.uiRole */
    role?: Role;
    /** Производное: mesBootstrap.profile (совместимость) */
    mesProfile?: MesBootstrapProfile;
};

/** Отменяет устаревшие refresh/login, чтобы они не перетёрли новую сессию. */
let bootstrapRequestId = 0;

function nextBootstrapRequestId(): number {
    bootstrapRequestId += 1;
    return bootstrapRequestId;
}

function isBootstrapRequestCurrent(requestId: number): boolean {
    return requestId === bootstrapRequestId;
}

function clearSessionState(
    setToken: (v: string | null) => void,
    setMesBootstrap: (v: MesBootstrap | undefined) => void,
    setClientEnvironment: (v: ClientEnvironment | undefined) => void,
) {
    clearStoredAuth();
    queryClient.clear();
    setToken(null);
    setMesBootstrap(undefined);
    setClientEnvironment(undefined);
}

export const useSession = createGStore(() => {
    const [token, setToken] = useState(() => readValidStoredAuthToken());
    const [mesBootstrap, setMesBootstrap] = useState<MesBootstrap | undefined>(undefined);
    const [clientEnvironment, setClientEnvironment] = useState<ClientEnvironment | undefined>(undefined);
    const [isBootstrapLoading, setIsBootstrapLoading] = useState(() => Boolean(readValidStoredAuthToken()));

    const applyBootstrap = (bootstrap: MesBootstrap) => {
        setMesBootstrap(bootstrap);
    };

    const loadClientEnvironment = async (bootstrap: MesBootstrap, loginName: string) => {
        try {
            const environment = await resolveClientEnvironmentFromBackend(bootstrap, loginName);
            setClientEnvironment(environment);
        } catch {
            setClientEnvironment(undefined);
        }
    };

    const refreshBootstrap = async () => {
        const requestId = nextBootstrapRequestId();
        const storedToken = readValidStoredAuthToken();
        if (!storedToken) {
            if (isBootstrapRequestCurrent(requestId)) {
                clearSessionState(setToken, setMesBootstrap, setClientEnvironment);
                setIsBootstrapLoading(false);
            }
            return;
        }

        setIsBootstrapLoading(true);
        try {
            const decoded = jwtDecode<JwtPayload>(storedToken);
            const bootstrap = await resolveMesUserProfileFromBackend(decoded.sub);
            if (!isBootstrapRequestCurrent(requestId)) {
                return;
            }
            setToken(storedToken);
            applyBootstrap(bootstrap);
            void loadClientEnvironment(bootstrap, decoded.sub);
        } catch {
            if (isBootstrapRequestCurrent(requestId)) {
                clearSessionState(setToken, setMesBootstrap, setClientEnvironment);
            }
        } finally {
            if (isBootstrapRequestCurrent(requestId)) {
                setIsBootstrapLoading(false);
            }
        }
    };

    const login = async (newToken: string): Promise<MesBootstrap> => {
        const requestId = nextBootstrapRequestId();
        setIsBootstrapLoading(true);
        setMesBootstrap(undefined);
        setClientEnvironment(undefined);
        setToken(null);

        try {
            if (isAuthTokenExpired(newToken)) {
                if (isBootstrapRequestCurrent(requestId)) {
                    clearSessionState(setToken, setMesBootstrap, setClientEnvironment);
                }
                throw new SessionRoleError("Сессия истекла, войдите снова");
            }

            let decoded: JwtPayload;
            try {
                decoded = jwtDecode<JwtPayload>(newToken);
            } catch {
                if (isBootstrapRequestCurrent(requestId)) {
                    clearSessionState(setToken, setMesBootstrap, setClientEnvironment);
                }
                throw new SessionRoleError("Некорректный токен");
            }

            setStoredAuthToken(newToken);

            const bootstrap = await resolveMesUserProfileFromBackend(decoded.sub);
            if (!isBootstrapRequestCurrent(requestId)) {
                const currentBootstrap = useSession.getState().mesBootstrap;
                if (currentBootstrap) {
                    return currentBootstrap;
                }
                throw new SessionRoleError("Не удалось войти");
            }
            applyBootstrap(bootstrap);
            setToken(newToken);
            void loadClientEnvironment(bootstrap, decoded.sub);
            return bootstrap;
        } catch (error) {
            if (isBootstrapRequestCurrent(requestId)) {
                clearSessionState(setToken, setMesBootstrap, setClientEnvironment);
            }
            throw error;
        } finally {
            if (isBootstrapRequestCurrent(requestId)) {
                setIsBootstrapLoading(false);
            }
        }
    };

    const syncWithStorage = () => {
        if (token && isAuthTokenExpired(token)) {
            clearSessionState(setToken, setMesBootstrap, setClientEnvironment);
            setIsBootstrapLoading(false);
            return;
        }

        const storedToken = readValidStoredAuthToken();
        if (token && !storedToken) {
            clearSessionState(setToken, setMesBootstrap, setClientEnvironment);
            setIsBootstrapLoading(false);
            return;
        }

        if (!token && storedToken) {
            setToken(storedToken);
        }
    };

    const logout = () => {
        clearSessionState(setToken, setMesBootstrap, setClientEnvironment);
        setIsBootstrapLoading(false);
    };

    let session: Session | null = null;
    if (token && !isAuthTokenExpired(token)) {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            session = {
                ...decoded,
                mesBootstrap,
                clientEnvironment,
                role: mesBootstrap?.access.uiRole,
                mesProfile: mesBootstrap?.profile,
            };
        } catch {
            session = null;
        }
    }

    return {
        session,
        token,
        mesBootstrap,
        clientEnvironment,
        isBootstrapLoading,
        login,
        logout,
        refreshBootstrap,
        syncWithStorage,
    };
});
