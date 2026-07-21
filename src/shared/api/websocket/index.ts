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
export { TEST_EVENT_STOMP_DESTINATION } from "./test-event-destination";
export { useTestEventStompSubscription } from "./use-test-event-subscription";

export {
    MATERIALS_FRONT_MACHINE_PRODUCTION_RELEASE_REGISTERED_STOMP_DESTINATION,
} from "./materials-front-machine-production-release-registered-destination";
export {
    MATERIALS_FRONT_MACHINE_RAW_RELEASE_REGISTERED_STOMP_DESTINATION,
} from "./materials-front-machine-raw-release-registered-destination";
export {
    MATERIALS_FRONT_SEMI_FINISHED_ROLL_RELEASED_STOMP_DESTINATION,
} from "./materials-front-semi-finished-roll-released-destination";
export {
    DOWNTIME_FRONT_MACHINE_SIGNAL_REGISTERED_STOMP_DESTINATION,
} from "./downtime-front-machine-signal-registered-destination";
export {
    pickSemiFinishedRollReleasedWorkAreaId,
    useMaterialsFrontSemiFinishedRollReleasedSubscription,
} from "./use-materials-front-semi-finished-roll-released-subscription";
export { useDowntimeFrontMachineSignalRegisteredSubscription } from "./use-downtime-front-machine-signal-registered-subscription";
export { useMaterialsFrontMachineProductionReleaseRegisteredSubscription } from "./use-materials-front-machine-production-release-registered-subscription";
export { useMaterialsFrontMachineRawReleaseRegisteredSubscription } from "./use-materials-front-machine-raw-release-registered-subscription";
