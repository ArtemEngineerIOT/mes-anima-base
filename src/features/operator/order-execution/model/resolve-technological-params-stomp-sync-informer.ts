import type { InformerTone } from "@/shared/ui/kit/informer";

import { resolveDeviceSyncStatus } from "./machine-stomp/device-sync-status";
import type { OrderExecutionMachineStompState } from "./machine-stomp/order-execution-machine-data";

export type TechnologicalParamsStompSyncInformer = {
    tone: InformerTone;
    title: string;
    description: string;
};

export function resolveTechnologicalParamsStompSyncInformer(
    stompState: OrderExecutionMachineStompState,
): TechnologicalParamsStompSyncInformer {
    // Синхронизация проверяется по подписке на переменную STOMP `parameters`.
    if (!stompState.isStompConnected || !stompState.hasReceivedStompData) {
        return {
            tone: "warning",
            title: "Синхронизация отсутствует",
            description: "Сигнал с машины не поступает. Текущие значения могут быть недоступны.",
        };
    }

    const syncStatus = resolveDeviceSyncStatus(stompState.snapshot.fields.sync_status);
    const hasActiveSignal = syncStatus.informerTone === "success";

    return {
        tone: hasActiveSignal ? "success" : "warning",
        title: "Машина синхронизирована",
        description: syncStatus.label,
    };
}
