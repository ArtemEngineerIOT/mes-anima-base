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

export type MaterialsWriteoffDefaults = {
    meters: string;
    weight: string;
    warehouse: string;
    warehouseOptions: string[];
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
