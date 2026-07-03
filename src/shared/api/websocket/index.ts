import { getStoredAuthToken } from "@/shared/model/auth-storage";
import { CONFIG } from "@/shared/model/config";

import { createWebsocketConnection } from "./manager";

export const webSocket = createWebsocketConnection({
    url: CONFIG.WS_URL,
    token: () => getStoredAuthToken() ?? "",
    reconnectAttempts: 5,
    reconnectTimeout: 3000,
    debug: import.meta.env.DEV || import.meta.env.VITE_WS_DEBUG === "true",
});

export const isWebSocketActive = () => webSocket.$opened.getState() || webSocket.$connecting.getState();

export type { IncomingMessage, SubscribeMessage, UnsubscribeMessage } from "./types";
