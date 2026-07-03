interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_DEV_PROXY_TARGET?: string;
    /** URL WebSocket-прокси STOMP (без query). В dev по умолчанию ws://localhost:4444 */
    readonly VITE_WS_URL?: string;
    /** Логи WebSocket/STOMP в консоли браузера (production). */
    readonly VITE_WS_DEBUG?: string;
    /** @deprecated Используйте VITE_WS_URL. */
    readonly VITE_STOMP_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
