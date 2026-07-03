import { jwtDecode } from "jwt-decode";

import { clearStoredAuth, getStoredAuthToken } from "@/shared/model/auth-storage";

/** JWT с истёкшим `exp` (или без `exp`) не считаем активной сессией. */
export function isAuthTokenExpired(token: string): boolean {
    try {
        const { exp } = jwtDecode<{ exp?: number }>(token);
        if (exp == null) {
            return false;
        }
        return exp * 1000 <= Date.now();
    } catch {
        return true;
    }
}

/** Токен из LS; при истечении срока — очищает storage и возвращает null. */
export function readValidStoredAuthToken(): string | null {
    const token = getStoredAuthToken();
    if (!token) {
        return null;
    }
    if (isAuthTokenExpired(token)) {
        clearStoredAuth();
        return null;
    }
    return token;
}
