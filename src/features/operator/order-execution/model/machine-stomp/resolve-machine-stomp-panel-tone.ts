import type { InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";

import { resolveDeviceSyncStatus } from "./device-sync-status";
import type { OrderExecutionMachineStompState } from "./order-execution-machine-data";

const DISCONNECTED_PANEL_TONE: InformerTone = "alert";
const DEFAULT_PANEL_TONE: InformerTone = "success";

/** Цвет плашки `MachineDataPanel` по STOMP `parameters` / `sync_status`. */
export function resolveMachineStompPanelTone(stompState: OrderExecutionMachineStompState): InformerTone {
    if (!stompState.isStompConnected) {
        return DISCONNECTED_PANEL_TONE;
    }

    const syncStatus = stompState.snapshot.fields.sync_status;
    if (syncStatus === undefined) {
        return DEFAULT_PANEL_TONE;
    }

    return resolveDeviceSyncStatus(syncStatus).informerTone;
}
