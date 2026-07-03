const defaultWsUrl = import.meta.env.DEV ? "ws://localhost:4444" : "";

export const CONFIG = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    /** Прокси STOMP; в production задайте VITE_WS_URL при сборке (например wss://хост/ws). */
    WS_URL: import.meta.env.VITE_WS_URL ?? import.meta.env.VITE_STOMP_URL ?? defaultWsUrl,
};
