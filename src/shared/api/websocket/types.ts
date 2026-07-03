export type WebSocketConfig = {
    url: string;
    token: string | (() => string);
    reconnectAttempts?: number;
    reconnectTimeout?: number;
    debug?: boolean;
};

export type IncomingMessage = {
    command: string;
    headers: Record<string, string>;
    body: unknown;
    event: string | null;
};

export type SubscribeMessage = {
    destination?: string;
    path?: string;
    event?: string;
};

export type UnsubscribeMessage = {
    subscription: string;
};

export type WebSocketReadableState<T> = {
    getState: () => T;
};
