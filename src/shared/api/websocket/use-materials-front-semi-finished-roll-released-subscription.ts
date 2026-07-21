import { useEffect, useRef } from "react";

import { webSocket, type IncomingMessage } from "./index";
import {
    MATERIALS_FRONT_SEMI_FINISHED_ROLL_RELEASED_STOMP_DESTINATION,
} from "./materials-front-semi-finished-roll-released-destination";

function pickString(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    return undefined;
}

/** Payload `semiFinishedRollReleased`: `work_area_id` / `workAreaId`. */
export function pickSemiFinishedRollReleasedWorkAreaId(body: unknown): string | undefined {
    const rows = Array.isArray(body) ? body : body && typeof body === "object" ? [body] : [];
    const first = rows[0];
    if (!first || typeof first !== "object") {
        return undefined;
    }
    const row = first as Record<string, unknown>;
    return pickString(row.work_area_id ?? row.workAreaId);
}

type UseMaterialsFrontSemiFinishedRollReleasedSubscriptionOptions = {
    enabled: boolean;
    /** Если задан — `onEvent` только при совпадении `work_area_id` в payload */
    workAreaId?: string;
    onEvent: (body: unknown) => void;
};

/**
 * STOMP подписка на `semiFinishedRollReleased`.
 * Данные события не храним — только триггерим `onEvent(body)`.
 */
export function useMaterialsFrontSemiFinishedRollReleasedSubscription({
    enabled,
    workAreaId,
    onEvent,
}: UseMaterialsFrontSemiFinishedRollReleasedSubscriptionOptions) {
    const onEventRef = useRef(onEvent);
    onEventRef.current = onEvent;

    const workAreaIdRef = useRef(workAreaId);
    workAreaIdRef.current = workAreaId;

    useEffect(() => {
        if (!enabled) {
            return;
        }

        let disposed = false;
        const subscriptionIds: string[] = [];

        const unwatch = webSocket.onMessage.watch((message: IncomingMessage) => {
            if (disposed) {
                return;
            }

            if (message.headers.destination !== MATERIALS_FRONT_SEMI_FINISHED_ROLL_RELEASED_STOMP_DESTINATION) {
                return;
            }

            const expectedWorkAreaId = workAreaIdRef.current?.trim();
            if (expectedWorkAreaId) {
                const eventWorkAreaId = pickSemiFinishedRollReleasedWorkAreaId(message.body);
                if (!eventWorkAreaId || eventWorkAreaId !== expectedWorkAreaId) {
                    return;
                }
            }

            onEventRef.current(message.body);
        });

        void webSocket.subscribe({
            destination: MATERIALS_FRONT_SEMI_FINISHED_ROLL_RELEASED_STOMP_DESTINATION,
        }).then((id) => {
            if (disposed) {
                if (id) {
                    void webSocket.unsubscribe({ subscription: id });
                }
                return;
            }

            if (id) {
                subscriptionIds.push(id);
            }
        });

        return () => {
            disposed = true;
            unwatch();
            for (const subscriptionId of subscriptionIds) {
                void webSocket.unsubscribe({ subscription: subscriptionId });
            }
        };
    }, [enabled]);
}
