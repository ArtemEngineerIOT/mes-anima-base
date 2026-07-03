import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { createGStore } from "create-gstore";

import type { MesBootstrap, MesBootstrapProfile } from "@/shared/lib/mes-user-profile";
import { clearStoredAuth, setStoredAuthToken } from "@/shared/model/auth-storage";
import { isAuthTokenExpired, readValidStoredAuthToken } from "@/shared/model/auth-token";
import { resolveMesUserProfileFromBackend, SessionRoleError } from "@/shared/model/resolve-mes-user-profile";
import type { Role } from "./roles";

export { SessionRoleError } from "@/shared/model/resolve-mes-user-profile";
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
    /** Производное: mesBootstrap.access.uiRole */
    role?: Role;
    /** Производное: mesBootstrap.profile (совместимость) */
    mesProfile?: MesBootstrapProfile;
};

function clearSessionState(
    setToken: (v: string | null) => void,
    setMesBootstrap: (v: MesBootstrap | undefined) => void,
) {
    clearStoredAuth();
    setToken(null);
    setMesBootstrap(undefined);
}

export const useSession = createGStore(() => {
    const [token, setToken] = useState(() => readValidStoredAuthToken());
    const [mesBootstrap, setMesBootstrap] = useState<MesBootstrap | undefined>(undefined);
    const [isBootstrapLoading, setIsBootstrapLoading] = useState(() => Boolean(readValidStoredAuthToken()));

    const applyBootstrap = (bootstrap: MesBootstrap) => {
        setMesBootstrap(bootstrap);
    };

    const refreshBootstrap = async () => {
        const storedToken = readValidStoredAuthToken();
        if (!storedToken) {
            clearSessionState(setToken, setMesBootstrap);
            setIsBootstrapLoading(false);
            return;
        }

        setIsBootstrapLoading(true);
        try {
            const decoded = jwtDecode<JwtPayload>(storedToken);
            const bootstrap = await resolveMesUserProfileFromBackend(decoded.sub);
            setToken(storedToken);
            applyBootstrap(bootstrap);
        } catch {
            clearSessionState(setToken, setMesBootstrap);
        } finally {
            setIsBootstrapLoading(false);
        }
    };

    const login = async (newToken: string): Promise<MesBootstrap> => {
        setIsBootstrapLoading(true);
        setMesBootstrap(undefined);
        setToken(null);

        try {
            if (isAuthTokenExpired(newToken)) {
                clearSessionState(setToken, setMesBootstrap);
                throw new SessionRoleError("Сессия истекла, войдите снова");
            }

            let decoded: JwtPayload;
            try {
                decoded = jwtDecode<JwtPayload>(newToken);
            } catch {
                clearSessionState(setToken, setMesBootstrap);
                throw new SessionRoleError("Некорректный токен");
            }

            setStoredAuthToken(newToken);

            const bootstrap = await resolveMesUserProfileFromBackend(decoded.sub);
            applyBootstrap(bootstrap);
            setToken(newToken);
            return bootstrap;
        } catch (error) {
            clearSessionState(setToken, setMesBootstrap);
            throw error;
        } finally {
            setIsBootstrapLoading(false);
        }
    };

    const logout = () => {
        clearSessionState(setToken, setMesBootstrap);
        setIsBootstrapLoading(false);
    };

    let session: Session | null = null;
    if (token && !isAuthTokenExpired(token)) {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            session = {
                ...decoded,
                mesBootstrap,
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
        isBootstrapLoading,
        login,
        logout,
        refreshBootstrap,
    };
});
