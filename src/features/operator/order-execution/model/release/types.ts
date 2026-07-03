export type ReleaseWarehouseOption = {
    warehouseCode: string;
    warehouseLabel: string;
};

export type ReleaseBatchRow = {
    id: string;
    barcode: string;
    externalSeriesKey: string;
    materialRollId: string;
    materialProductionReleaseId: string;
    rollTraceContextId: string;
    nomenclature: string;
    nomenclatureCode: string;
    qty1: number;
    unit1: string;
    qty2: number;
    unit2: string;
    rollStatus: string;
    rollStatusLabel: string;
    blocked: boolean;
    blockReasonCode: string;
    statusLabel: string;
};

export type ReleaseInputRollRow = {
    id: string;
    barcode: string;
    externalSeriesKey: string;
    materialRollId: string;
    rollTraceContextId: string;
    meterCardId: string;
    nomenclature: string;
    nomenclatureCode: string;
    qty1: number;
    unit1: string;
    qty2: number;
    unit2: string;
    stageInputCardStatus: string;
    rollStatus: string;
    rollStatusLabel: string;
    blockSelectable: boolean;
};

export type ReleaseBlockReason = {
    reasonCode: string;
    reasonLabel: string;
};

export type ReleaseFormState = {
    lengthM: string;
    netWeightKg: string;
    grossWeightKg: string;
    warehouse: string;
    requiresRewind: boolean;
    selectedInputRollIds: string[];
    blockReason: string;
    warehouseComment: string;
};

export type ReleaseInitSnapshot = {
    workAreaId: string;
    predictedExternalSeriesKey: string;
    seriesBase: string;
    nextRollIndex: number | null;
    releaseCountOnWorkArea: number | null;
    warehouseOptions: ReleaseWarehouseOption[];
    defaultWarehouseCode: string;
};

export const RELEASE_EMPTY_INIT: ReleaseInitSnapshot = {
    workAreaId: "",
    predictedExternalSeriesKey: "",
    seriesBase: "",
    nextRollIndex: null,
    releaseCountOnWorkArea: null,
    warehouseOptions: [],
    defaultWarehouseCode: "",
};

export const RELEASE_INITIAL_FORM: ReleaseFormState = {
    lengthM: "",
    netWeightKg: "",
    grossWeightKg: "",
    warehouse: "",
    requiresRewind: false,
    selectedInputRollIds: [],
    blockReason: "",
    warehouseComment: "",
};
