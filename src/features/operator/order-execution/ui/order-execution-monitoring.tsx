import type { MutableRefObject } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

import type { MachineId } from "../model/types";
import { OrderExecutionMonitoringContent } from "./order-execution-monitoring-content";

type OrderExecutionMonitoringProps = {
    machineId: MachineId;
    workAreaId?: string;
    lineMetersSilentReloadRef?: MutableRefObject<(() => void) | null>;
};

export function OrderExecutionMonitoring({
    machineId,
    workAreaId,
    lineMetersSilentReloadRef,
}: OrderExecutionMonitoringProps) {
    return (
        <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden py-0">
            <CardHeader className="shrink-0 gap-0 border-b bg-card px-4 py-3 shadow-[0_8px_12px_-12px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between gap-0">
                    <CardTitle className={cnSectionBlockTitle()}>Мониторинг</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
                <div className="app-scroll flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-4 pt-3">
                    <OrderExecutionMonitoringContent
                        machineId={machineId}
                        workAreaId={workAreaId}
                        showShowAllButton
                        lineMetersSilentReloadRef={lineMetersSilentReloadRef}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
