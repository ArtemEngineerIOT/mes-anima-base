import createFetchClient from "openapi-fetch";

import type { ApiPaths } from "./schema";
import { CONFIG } from "@/shared/model/config";
import { readValidStoredAuthToken } from "@/shared/model/auth-token";

/** Токен, с которым ушёл запрос — для 401 не разлогинивать из‑за устаревших in-flight вызовов. */
const requestAuthToken = new WeakMap<Request, string | null>();

export function getRequestAuthToken(request: Request): string | null | undefined {
    return requestAuthToken.get(request);
}

/** Приватный openapi-fetch клиент (без React Query). */
export const fetchClient = createFetchClient<ApiPaths>({
    baseUrl: CONFIG.API_BASE_URL,
});

fetchClient.use({
    onRequest({ request }) {
        const token = readValidStoredAuthToken();
        requestAuthToken.set(request, token);
        if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
        }
        return undefined;
    },
});
