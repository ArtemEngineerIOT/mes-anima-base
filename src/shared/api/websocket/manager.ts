import type {
    IncomingMessage,
    SubscribeMessage,
    UnsubscribeMessage,
    WebSocketConfig,
    WebSocketReadableState,
} from "./types";
import { createRandomId } from "@/shared/lib/create-random-id";

const NORMAL_CLOSURE = 1000;

type Watcher<T> = (payload: T) => void;

function createId(): string {
    return createRandomId("sub-");
}

function createReadableState<T>(getState: () => T): WebSocketReadableState<T> {
    return { getState };
}

function parseStompResponse(response: string): IncomingMessage {
    const lines = response.split("\n");
    const command = lines[0] ?? "";
    const headers: Record<string, string> = {};

    let i = 1;
    for (; i < lines.length; i += 1) {
        const line = lines[i] ?? "";
        if (line.trim() === "") {
            break;
        }

        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) {
            continue;
        }

        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        if (key) {
            headers[key] = value;
        }
    }

    let body = lines.slice(i + 1).join("\n").trim();
    if (body.endsWith("\x00")) {
        body = body.slice(0, -1);
    }

    let parsedBody: unknown = body;
    if (body) {
        try {
            parsedBody = JSON.parse(body);
        } catch {
            parsedBody = body;
        }
    }

    const destination = headers.destination;
    const event = destination ? destination.slice(destination.lastIndexOf("/") + 1) : null;

    return { command, headers, body: parsedBody, event };
}

function resolveDestination(params: SubscribeMessage): string | null {
    if (params.destination?.trim()) {
        return params.destination.trim();
    }

    if (params.path?.trim() && params.event?.trim()) {
        return `${params.path.trim()}/${params.event.trim()}`;
    }

    return null;
}

export function createWebsocketConnection(config: WebSocketConfig) {
    const reconnectAttempts = config.reconnectAttempts ?? 5;
    const reconnectTimeout = config.reconnectTimeout ?? 3000;

    let socket: WebSocket | null = null;
    let status: number = WebSocket.CLOSED;
    let reconnectAttempt = 0;
    let reconnectTimer: number | null = null;
    let proxyConnected = false;
    const subscriptions = new Set<string>();
    const queuedSubscriptions: { id: string; message: string }[] = [];

    const messageWatchers = new Set<Watcher<IncomingMessage>>();

    function getToken(): string {
        return typeof config.token === "function" ? config.token() : config.token;
    }

    function debug(...args: unknown[]) {
        if (config.debug) {
            console.info("[WS]", ...args);
        }
    }

    function emitMessage(message: IncomingMessage) {
        messageWatchers.forEach((watcher) => watcher(message));
    }

    function sendRaw(message: string): void {
        if (!socket || status !== WebSocket.OPEN) {
            return;
        }

        socket.send(message);
    }

    function sendConnectMessage(): void {
        sendRaw(`CONNECT\nAuthorization:${getToken()}`);
        debug("Sent CONNECT");
    }

    function flushSubscriptionQueue(): void {
        if (!socket || status !== WebSocket.OPEN) {
            return;
        }

        while (queuedSubscriptions.length > 0) {
            const item = queuedSubscriptions.shift();
            if (!item) {
                break;
            }

            socket.send(item.message);
            subscriptions.add(item.id);
        }
    }

    function scheduleReconnect(event: CloseEvent): void {
        if (event.code === NORMAL_CLOSURE || reconnectAttempt >= reconnectAttempts) {
            return;
        }

        reconnectAttempt += 1;
        reconnectTimer = window.setTimeout(() => {
            init();
        }, reconnectTimeout);
    }

    function init(): void {
        if (!config.url) {
            debug("URL is empty, skip connect");
            return;
        }

        if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
            debug("Already connecting/connected");
            return;
        }

        if (reconnectTimer !== null) {
            window.clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }

        proxyConnected = false;
        status = WebSocket.CONNECTING;

        const token = encodeURIComponent(getToken());
        socket = new WebSocket(`${config.url}?token=${token}`);

        socket.onopen = () => {
            status = WebSocket.OPEN;
            reconnectAttempt = 0;
            debug("Open");
        };

        socket.onclose = (event) => {
            status = WebSocket.CLOSED;
            proxyConnected = false;
            debug("Close", event.code, event.reason);
            scheduleReconnect(event);
        };

        socket.onerror = (event) => {
            debug("Error", event);
        };

        socket.onmessage = (event) => {
            const data = String(event.data);
            if (data === "CONNECTED") {
                proxyConnected = true;
                debug("Proxy CONNECTED received");
                sendConnectMessage();
                flushSubscriptionQueue();
                return;
            }

            if (data.startsWith("ERROR:")) {
                console.error("[WS]", data);
                proxyConnected = false;
                return;
            }

            try {
                emitMessage(parseStompResponse(data));
            } catch (error) {
                console.error("[WS] Parse error:", error);
            }
        };
    }

    function closeWebSocket(): void {
        if (!socket || status === WebSocket.CLOSED || status === WebSocket.CLOSING) {
            return;
        }

        socket.close(NORMAL_CLOSURE);
        socket = null;
        status = WebSocket.CLOSED;
        proxyConnected = false;
        subscriptions.clear();
        queuedSubscriptions.length = 0;
    }

    async function subscribe(params: SubscribeMessage): Promise<string | null> {
        const destination = resolveDestination(params);
        if (!destination) {
            console.error("[WS] Subscribe: no destination provided");
            return null;
        }

        const id = createId();
        const message = `SUBSCRIBE\nid:${id}\ndestination:${destination}`;

        if (!socket || status !== WebSocket.OPEN || !proxyConnected) {
            queuedSubscriptions.push({ id, message });
            init();
            return id;
        }

        socket.send(message);
        subscriptions.add(id);
        return id;
    }

    async function unsubscribe({ subscription }: UnsubscribeMessage): Promise<void> {
        if (!subscription) {
            return;
        }

        sendRaw(`UNSUBSCRIBE\nid:${subscription}`);
        subscriptions.delete(subscription);
    }

    async function unsubscribeAll(): Promise<void> {
        subscriptions.forEach((subscription) => {
            sendRaw(`UNSUBSCRIBE\nid:${subscription}`);
        });
        subscriptions.clear();
        queuedSubscriptions.length = 0;
    }

    return {
        init,
        closeWebSocket,
        subscribe,
        unsubscribe,
        unsubscribeAll,
        onMessage: {
            watch(watcher: Watcher<IncomingMessage>) {
                messageWatchers.add(watcher);
                return () => {
                    messageWatchers.delete(watcher);
                };
            },
        },
        $opened: createReadableState(() => status === WebSocket.OPEN),
        $connecting: createReadableState(() => status === WebSocket.CONNECTING),
        $closed: createReadableState(() => status === WebSocket.CLOSED),
        $isProxyConnected: createReadableState(() => proxyConnected),
        $subscriptions: createReadableState(() => [...subscriptions]),
    };
}
