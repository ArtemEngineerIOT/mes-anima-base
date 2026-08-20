import { useRef } from "react";

import { useOrderExecution } from "@/features/operator/order-execution/model/use-order-execution";
import { OrderExecutionMachineStompProvider } from "@/features/operator/order-execution/model/machine-stomp/order-execution-machine-stomp-context";
import { useStageProgress } from "@/features/operator/order-execution/model/stage-progress/use-stage-progress";
import { OrderExecutionEmpty } from "@/features/operator/order-execution/ui/order-execution-empty";
import { OrderExecutionFilters } from "@/features/operator/order-execution/ui/order-execution-filters";
import { OrderExecutionMonitoring } from "@/features/operator/order-execution/ui/order-execution-monitoring";
import { OrderExecutionOperatorPanel } from "@/features/operator/order-execution/ui/order-execution-operator-panel";
import { Informer } from "@/shared/ui/kit/informer";

function OrderExecutionPage() {
    const {
        machineOptions,
        isMachineOptionsLoading,
        isMachineDataLoading,
        selectedMachine,
        setSelectedMachine,
        current,
        fetchError,
    } = useOrderExecution();

    const machineMatchesSelection =
        Boolean(selectedMachine) && current.machineId === selectedMachine;
    const isMachineContextPending =
        isMachineOptionsLoading || isMachineDataLoading || (Boolean(selectedMachine) && !machineMatchesSelection);
    const showAssignedStage = machineMatchesSelection && !isMachineDataLoading && current.hasAssignedStage;
    /**
     * Не размонтируем мониторинг/панель при смене машины: иначе cleanup снимает все STOMP
     * (сигналы, списание, выпуск…). Параметры машины переподписываются отдельно по machineId.
     */
    const keepStageWorkspaceDuringMachineSwitch =
        isMachineDataLoading && current.hasAssignedStage && Boolean(selectedMachine);
    const showStageWorkspace = showAssignedStage || keepStageWorkspaceDuringMachineSwitch;
    const workAreaId = showStageWorkspace ? current.workAreaId : undefined;
    const jobInfo = showAssignedStage ? current.operator.jobInfo : null;
    const lineMetersSilentReloadRef = useRef<(() => void) | null>(null);
    const rollTablesSilentReloadRef = useRef<(() => void) | null>(null);
    const stageEventsSilentReloadRef = useRef<(() => void) | null>(null);

    const { progressInfo, reload: reloadProgress } = useStageProgress({
        workAreaId,
        enabled: showAssignedStage,
    });
    const reloadProgressRef = useRef(reloadProgress);
    reloadProgressRef.current = reloadProgress;

    return (
        <div className="flex h-full min-h-0 flex-col">
            <OrderExecutionFilters
                machineOptions={machineOptions}
                isMachineOptionsLoading={isMachineOptionsLoading || isMachineDataLoading}
                selectedMachine={selectedMachine}
                onMachineChange={setSelectedMachine}
                jobInfo={jobInfo}
                progressInfo={progressInfo}
            />

            {fetchError && (
                <Informer
                    className="mt-3 shrink-0"
                    tone="alert"
                    variant="filled"
                    size="s"
                    title="Ошибка загрузки"
                    description={fetchError}
                />
            )}

            {selectedMachine ? (
                <OrderExecutionMachineStompProvider
                    enabled
                    machineId={selectedMachine}
                    workAreaId={workAreaId}
                >
                    {showStageWorkspace ? (
                        <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-3 overflow-hidden lg:grid-cols-[minmax(0,2.5fr)_minmax(0,3.5fr)] lg:grid-rows-[minmax(0,1fr)]">
                            <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden contain-layout">
                                <OrderExecutionMonitoring
                                    machineId={current.machineId}
                                    workAreaId={current.workAreaId}
                                    lineMetersSilentReloadRef={lineMetersSilentReloadRef}
                                    rollTablesSilentReloadRef={rollTablesSilentReloadRef}
                                    stageEventsSilentReloadRef={stageEventsSilentReloadRef}
                                />
                            </div>
                            <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden contain-layout">
                                <OrderExecutionOperatorPanel
                                    operator={current.operator}
                                    machineId={current.machineId}
                                    workAreaId={current.workAreaId}
                                    workAreaStart={current.workAreaStart}
                                    order={current.order.orderId}
                                    releaseBlockSummary={current.releaseBlockSummary}
                                    writeOffBlockSummary={current.writeOffBlockSummary}
                                    machineSignalsBlockSummary={current.machineSignalsBlockSummary}
                                    stageCompletionBlockSummary={current.stageCompletionBlockSummary}
                                    onMonitoringSummaryReload={() => {
                                        lineMetersSilentReloadRef.current?.();
                                        rollTablesSilentReloadRef.current?.();
                                        stageEventsSilentReloadRef.current?.();
                                    }}
                                    onReleaseRegistered={() => {
                                        lineMetersSilentReloadRef.current?.();
                                        rollTablesSilentReloadRef.current?.();
                                        stageEventsSilentReloadRef.current?.();
                                        void reloadProgressRef.current({ silent: true });
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="mt-3">
                            {isMachineContextPending ? (
                                <p className="text-sm text-muted-foreground">Загрузка данных по машине…</p>
                            ) : (
                                <OrderExecutionEmpty />
                            )}
                        </div>
                    )}
                </OrderExecutionMachineStompProvider>
            ) : (
                <div className="mt-3">
                    {isMachineContextPending ? (
                        <p className="text-sm text-muted-foreground">Загрузка данных по машине…</p>
                    ) : (
                        <OrderExecutionEmpty />
                    )}
                </div>
            )}
        </div>
    );
}

export const Component = OrderExecutionPage;
