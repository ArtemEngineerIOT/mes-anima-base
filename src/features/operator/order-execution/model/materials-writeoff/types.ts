export type MaterialsSeriesCard = {
    nomenclatureName: string;
    nomenclatureCode: string;
    seriesRef: string;
    externalSeriesKey: string;
    quantityUom: string;
    currentLengthM: number;
    currentWeightKg: number;
    isSemiFinished: boolean;
};

export type MaterialsReturnWarehouseOption = {
    warehouseCode: string;
    warehouseLabel: string;
};

export type MaterialsWriteoffDefaults = {
    meters: string;
    weight: string;
    warehouse: string;
    warehouseOptions: MaterialsReturnWarehouseOption[];
};

export type MaterialsStageOperationDetail = {
    label: string;
    qty1: number;
    unit1: string;
    qty2: number;
    unit2: string;
    operationKind?: string;
};

export type MaterialsStageOperation = {
    id: string;
    materialRollId: string;
    barcode: string;
    nomenclature: string;
    qty1: number;
    unit1: string;
    qty2: number;
    unit2: string;
    rollStatus?: string;
    rollStatusLabel?: string;
    stageInputCardStatus?: string;
    details?: MaterialsStageOperationDetail[];
};

export type MaterialsStageRegistrySnapshot = {
    rows: MaterialsStageOperation[];
    asOf: string | null;
    workAreaId: string | null;
};

export type MaterialsPresenceStatus = "WAITING" | "ON_UNWIND";

export type MaterialsPresenceRow = {
    id: string;
    materialRollId: string;
    barcode: string;
    nomenclatureName: string;
    nomenclatureCode: string;
    scannedAt: string;
    status: MaterialsPresenceStatus;
    quantityUom: string;
    currentLengthM: number;
    currentWeightKg: number;
    canMoveToUnwind: boolean;
    writeOffAllowed: boolean;
};

export type MaterialsRollPresenceSnapshot = {
    rows: MaterialsPresenceRow[];
    asOf: string | null;
    workAreaId: string | null;
};

export type MaterialsResolveBarcodeOnStageResult = {
    stageSpecStatus: string;
    stageSpecBannerVisible: boolean;
    stageSpecBannerTitle: string;
    stageSpecBannerDetail: string;
    alreadyRegisteredOnStage: boolean;
    scanBlockedByActiveInput: boolean;
    materialRollId: string;
    rollTraceContextId: string;
    presenceStatus: string;
    presenceRefreshHint: boolean;
    stageRegistryRefreshHint: boolean;
};

export type MaterialsSubmitMoveToUnwindResult = {
    materialRollId: string;
    presenceStatus: string;
    presenceRefreshHint: boolean;
    stageRegistryRefreshHint: boolean;
};

export type MaterialsSubmitPartialReturnResult = {
    presenceRefreshHint: boolean;
    stageRegistryRefreshHint: boolean;
};

export type MaterialsSubmitFullWriteOffResult = {
    presenceRefreshHint: boolean;
    stageRegistryRefreshHint: boolean;
};

export type MaterialsWriteoffData = {
    stageSpecStatus: string;
    stageSpecBannerVisible: boolean;
    stageSpecBannerTitle: string;
    stageSpecBannerDetail: string;
    alreadyRegisteredOnStage: boolean;
    materialRollId: string;
    rollTraceContextId: string;
    stageRegistryRefreshHint: boolean;
    seriesCard: MaterialsSeriesCard | null;
    writeoffDefaults: MaterialsWriteoffDefaults | null;
};
