import { useSearchParams } from "react-router";

import { OrderExecutionMachineStompProvider } from "@/features/operator/order-execution/model/machine-stomp/order-execution-machine-stomp-context";
import { OrderExecutionTechnologicalParamsPanel } from "@/features/operator/order-execution/ui/order-execution-technological-params-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { Informer } from "@/shared/ui/kit/informer";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

import type { MachineId } from "./order-execution/model/types";

function buildTechParamsPageTitle(machineId: MachineId): string {
    return `Технологические параметры машины · ${machineId}`;
}

function OrderExecutionMonitoringPage() {
    const [searchParams] = useSearchParams();
    const machineId = (searchParams.get("machineId")?.trim() ?? "") as MachineId;
    const workAreaId = searchParams.get("workAreaId")?.trim() ?? "";

    if (!machineId) {
        return (
            <Card className="gap-0 py-0">
                <CardContent className="p-4">
                    <Informer
                        tone="warning"
                        variant="filled"
                        title="Не удалось открыть технологические параметры"
                        description="Укажите machineId в адресной строке или откройте страницу кнопкой «Показать все» на экране исполнения заказа."
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden py-0">
            <CardHeader className="shrink-0 gap-0 border-b bg-card px-4 py-3 shadow-[0_8px_12px_-12px_rgba(0,0,0,0.45)]">
                <CardTitle className={cnSectionBlockTitle()}>{buildTechParamsPageTitle(machineId)}</CardTitle>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-3">
                    <OrderExecutionMachineStompProvider
                        enabled={Boolean(workAreaId)}
                        workAreaId={workAreaId}
                        subscribeToTags
                    >
                        <OrderExecutionTechnologicalParamsPanel
                            machineId={machineId}
                            workAreaId={workAreaId || undefined}
                            layout="page"
                            showTitle={false}
                        />
                    </OrderExecutionMachineStompProvider>
                </div>
            </CardContent>
        </Card>
    );
}

export const Component = OrderExecutionMonitoringPage;
