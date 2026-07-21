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
    MATERIALS_FRONT_ROLL_WRITE_OFF_RAW_EVENTS_SUMMARY_CHANGED_STOMP_DESTINATION,
} from "./materials-front-roll-write-off-raw-events-summary-changed-destination";
export {
    MATERIALS_FRONT_ROLL_RELEASE_PRODUCTION_EVENTS_SUMMARY_CHANGED_STOMP_DESTINATION,
} from "./materials-front-roll-release-production-events-summary-changed-destination";
export {
    useMaterialsFrontRollWriteOffRawEventsSummaryChangedSubscription,
} from "./use-materials-front-roll-write-off-raw-events-summary-changed-subscription";
export {
    useMaterialsFrontRollReleaseProductionEventsSummaryChangedSubscription,
} from "./use-materials-front-roll-release-production-events-summary-changed-subscription";
export { useMaterialsFrontMachineProductionReleaseRegisteredSubscription } from "./use-materials-front-machine-production-release-registered-subscription";
