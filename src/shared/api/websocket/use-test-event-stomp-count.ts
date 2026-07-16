import { useEffect, useMemo, useState } from "react";

import { webSocket } from "./index";
import { TEST_EVENT_STOMP_DESTINATION } from "./test-event-destination";
import type { IncomingMessage } from "./types";

function pickFiniteNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) {
            return undefined;
        }
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
}

function parseTestEventCount(body: unknown): number | undefined {
    const payload = body;
    if (!Array.isArray(payload)) {
        return undefined;
    }

    const first = payload[0];
    if (!first || typeof first !== "object") {
        return undefined;
    }

    const count = (first as Record<string, unknown>).count;
    return pickFiniteNumber(count);
}

/**
 * Возвращает `count` из STOMP `testEvent`:
 * пример: `[{ "count": 4 }]`
 *
 * Подписка на сам destination создаётся в `ProtectedRoute`, этот хук только слушает входящие сообщения.
 */
export function useTestEventStompCount({ enabled }: { enabled: boolean }): number | undefined {
    const [count, setCount] = useState<number | undefined>(undefined);

    const enabledValue = useMemo(() => enabled, [enabled]);

    useEffect(() => {
        if (!enabledValue) {
            return;
        }

        let disposed = false;

        const unwatch = webSocket.onMessage.watch((message: IncomingMessage) => {
            if (disposed) {
                return;
            }

            if (message.headers.destination !== TEST_EVENT_STOMP_DESTINATION) {
                return;
            }

            const next = parseTestEventCount(message.body);
            if (next === undefined) {
                return;
            }

            setCount(next);
        });

        return () => {
            disposed = true;
            unwatch();
        };
    }, [enabledValue]);

    return count;
}

