import { useOrderExecution } from "@/features/operator/order-execution/model/use-order-execution";
import { OrderExecutionMachineStompProvider } from "@/features/operator/order-execution/model/machine-stomp/order-execution-machine-stomp-context";
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

    const showAssignedStage = !isMachineDataLoading && current.hasAssignedStage;
    const jobInfo = showAssignedStage ? current.operator.jobInfo : null;

    return (
        <div className="flex h-full min-h-0 flex-col">
            <OrderExecutionFilters
                machineOptions={machineOptions}
                isMachineOptionsLoading={isMachineOptionsLoading || isMachineDataLoading}
                selectedMachine={selectedMachine}
                onMachineChange={setSelectedMachine}
                jobInfo={jobInfo}
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

            {showAssignedStage ? (
                <OrderExecutionMachineStompProvider enabled workAreaId={current.workAreaId}>
                    <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[2.5fr_3.5fr]">
                        <div className="flex min-h-0 min-w-0 flex-col">
                            <OrderExecutionMonitoring
                                machineId={current.machineId}
                                workAreaId={current.workAreaId}
                            />
                        </div>
                        <OrderExecutionOperatorPanel
                            operator={current.operator}
                            machineId={current.machineId}
                            workAreaId={current.workAreaId}
                        />
                    </div>
                </OrderExecutionMachineStompProvider>
            ) : (
                <div className="mt-3">
                    {isMachineDataLoading ? (
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
