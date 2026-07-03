import { useSyncExternalStore } from "react";

import { webSocket } from "@/shared/api/websocket";

function getStompConnected(): boolean {
    return webSocket.$opened.getState() && webSocket.$isProxyConnected.getState();
}

export function useWebSocketStompConnected(enabled: boolean): boolean {
    const isConnected = useSyncExternalStore(
        (onStoreChange) => {
            const intervalId = window.setInterval(onStoreChange, 500);
            return () => {
                window.clearInterval(intervalId);
            };
        },
        getStompConnected,
        () => false,
    );

    return enabled && isConnected;
}
