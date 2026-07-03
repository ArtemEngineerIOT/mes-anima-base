import { fetchClient } from "@/shared/api/fetch-client";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import type { MesBootstrap } from "@/shared/lib/mes-user-profile";
import { resolveMesUserProfileFromResponse } from "@/shared/lib/mes-user-profile";
import { readValidStoredAuthToken } from "@/shared/model/auth-token";

export class SessionRoleError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SessionRoleError";
    }
}

const inflightByKey = new Map<string, Promise<MesBootstrap>>();

async function fetchMesUserProfileFromBackend(loginName: string): Promise<MesBootstrap> {
    const authToken = readValidStoredAuthToken();
    if (!authToken) {
        throw new SessionRoleError("Не удалось получить профиль пользователя");
    }

    const response = await fetchClient.POST(REST_FUNCTION_PATHS.mesUserProfile, {
        body: [{ login: loginName }],
    });

    if (response.error || !response.data) {
        const status = response.response?.status;
        throw new SessionRoleError(
            status === 403 ? "Нет доступа к приложению" : "Не удалось получить профиль пользователя",
        );
    }

    try {
        return resolveMesUserProfileFromResponse(response.data);
    } catch (error) {
        throw new SessionRoleError(error instanceof Error ? error.message : "Не удалось получить профиль пользователя");
    }
}

/** Дедупликация параллельных вызовов (login + гидратация после F5). */
export function resolveMesUserProfileFromBackend(loginName: string): Promise<MesBootstrap> {
    const key = `${readValidStoredAuthToken() ?? ""}:${loginName}`;
    const existing = inflightByKey.get(key);
    if (existing) {
        return existing;
    }

    const promise = fetchMesUserProfileFromBackend(loginName).finally(() => {
        inflightByKey.delete(key);
    });
    inflightByKey.set(key, promise);
    return promise;
}
