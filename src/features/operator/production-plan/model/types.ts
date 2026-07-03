export type StageStatus = "planned" | "in_progress" | "paused" | "done" | "cancelled";

export type ProductionStage = {
    stageId: string;
    /** Идентификатор рабочей области (`work_area_id` в ответе); в запросах — `workAreaId`. */
    workAreaId: string;
    orderId: string;
    client?: string;
    /** Номер клиента (`client_number`). */
    clientNumber?: string;
    product?: string;
    operationNo?: string;
    stageName: string;
    area: string;
    machine?: string;
    quantity?: number;
    unit?: string;
    orderDate?: string;
    startAt?: string;
    endAt?: string;
    status: StageStatus;
    /** Подпись статуса с бэка (`status`), если есть. */
    statusDisplayLabel?: string;
    /** Доступные действия из `allowed_actions`. */
    allowedActions?: ProductionPlanAction[];
    hasPrevUnfinished?: boolean;
};

export type ProductionPlanAction = "start" | "pause" | "continue";

export type ProductionPlanFilters = {
    dateFrom: string;
    dateTo: string;
    /** null — все машины; иначе `resourceCode` из getProductionPlanMachines */
    resourceCode: string | null;
};

/** Элемент списка машин из getProductionPlanMachines. */
export type ProductionPlanMachine = {
    resourceCode: string;
    machine: string;
};

/** Значение `<select>` для пункта «Все машины» (в API уходит `null`). */
export const ALL_MACHINES_SELECT_VALUE = "";
