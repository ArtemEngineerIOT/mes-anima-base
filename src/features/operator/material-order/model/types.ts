export type MaterialOrderMachineId = "PR110" | "PR120" | "LM250" | "LM230";

export type NomenclatureKindId = "raw" | "semi" | "pack";

export type MaterialOrderPlanStage = {
    id: string;
    workAreaId: string;
    stage: string;
    orderId: string;
    orderDate: string;
    client: string;
    product: string;
    quantity: string;
    startAt: string;
    endAt: string;
};
