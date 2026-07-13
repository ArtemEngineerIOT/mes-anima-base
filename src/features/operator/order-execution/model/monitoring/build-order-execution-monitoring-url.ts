import { ROUTES } from "@/shared/model/routes";

export type OrderExecutionMonitoringUrlParams = {
    machineId: string;
    workAreaId?: string;
};

export function buildOrderExecutionMonitoringUrl(params: OrderExecutionMonitoringUrlParams): string {
    const search = new URLSearchParams({
        machineId: params.machineId.trim(),
    });
    const workAreaId = params.workAreaId?.trim();
    if (workAreaId) {
        search.set("workAreaId", workAreaId);
    }

    return `${ROUTES.OPERATOR.ORDER_EXECUTION_MONITORING}?${search.toString()}`;
}

export function openOrderExecutionMonitoringTab(params: OrderExecutionMonitoringUrlParams): void {
    const machineId = params.machineId.trim();
    if (!machineId) {
        return;
    }

    window.open(
        buildOrderExecutionMonitoringUrl({
            machineId,
            workAreaId: params.workAreaId,
        }),
        "_blank",
        "noopener,noreferrer",
    );
}
