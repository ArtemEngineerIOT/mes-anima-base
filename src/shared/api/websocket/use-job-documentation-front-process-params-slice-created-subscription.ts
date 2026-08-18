import { useEffect, useRef } from "react";

import { webSocket, type IncomingMessage } from "./index";
import { JOB_DOCUMENTATION_FRONT_PROCESS_PARAMS_SLICE_CREATED_STOMP_DESTINATION } from "./job-documentation-front-process-params-slice-created-destination";

type UseJobDocumentationFrontProcessParamsSliceCreatedSubscriptionOptions = {
    enabled: boolean;
    onEvent: (payload: unknown) => void;
};

/**
 * STOMP подписка на `processParamsSliceCreated` (Aggregate jobDocumentationFrontEvents).
 * После события на экране технологических параметров перезагружаем `getLastProcessParamsSlices`
 * и обновляем колонки срезов из поля `slices`.
 */
export function useJobDocumentationFrontProcessParamsSliceCreatedSubscription({
    enabled,
    onEvent,
}: UseJobDocumentationFrontProcessParamsSliceCreatedSubscriptionOptions) {
    const onEventRef = useRef(onEvent);
    onEventRef.current = onEvent;

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

            if (
                message.headers.destination !==
                JOB_DOCUMENTATION_FRONT_PROCESS_PARAMS_SLICE_CREATED_STOMP_DESTINATION
            ) {
                return;
            }

            onEventRef.current(message.body);
        });

        void webSocket
            .subscribe({
                destination: JOB_DOCUMENTATION_FRONT_PROCESS_PARAMS_SLICE_CREATED_STOMP_DESTINATION,
            })
            .then((id) => {
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
