export type DefectWeighingStage = {
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

export type DefectEventCode = {
    code: string;
    label: string;
    isPopular: boolean;
};

export type DefectWeighingScaleOption = {
    id: string;
    label: string;
};

export type DefectWeighingJournalRow = {
    id: string;
    stageLabel: string;
    registeredAt: string;
    weightKg: number;
    defectLabel: string;
    note: string;
};

export type DefectWeighingFormState = {
    scaleId: string;
    weightKg: string;
    eventCode: string;
    note: string;
};
