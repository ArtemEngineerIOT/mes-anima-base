import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

import { fetchClient, getRequestAuthToken } from "./fetch-client";
import type { ApiPaths } from "./schema";
import { CONFIG } from "@/shared/model/config";
import { readValidStoredAuthToken } from "@/shared/model/auth-token";
import { useSession } from "../model/session";

// public
export const publicFetchClient = createFetchClient<ApiPaths>({
    baseUrl: CONFIG.API_BASE_URL,
});

export const publicRqClient = createClient(publicFetchClient);

export { fetchClient };

fetchClient.use({
    async onResponse({ response, request }) {
        if (response.status === 401 && !request.url.includes("/auth")) {
            const requestToken = getRequestAuthToken(request) ?? null;
            const currentToken = readValidStoredAuthToken();
            const sessionToken = useSession.getState().token ?? null;

            const isStaleUserRequest =
                requestToken != null && currentToken != null && requestToken !== currentToken;
            const isExpiredSessionRequest =
                sessionToken != null &&
                (requestToken === sessionToken || requestToken == null) &&
                (currentToken == null || currentToken === sessionToken);

            if (!isStaleUserRequest && (requestToken === currentToken || isExpiredSessionRequest)) {
                useSession.getState().logout();
            }
        }
        return response;
    },
});

export const rqClient = createClient(fetchClient);
