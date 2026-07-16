export type ReleaseProductionEventDisplayRow = {
    characteristic: string;
    value: string;
    unit: string;
};

export type ReleaseProductionCurrentEvent = {
    machineEventSignalId: string;
    eventCode: string;
    eventCodeLabel: string;
    eventAt: string;
    informerDetail: string;
    registerAction: string;
    displayRows: ReleaseProductionEventDisplayRow[];
};

export type ReleaseProductionEventSnapshot = {
    workAreaId: string;
    plateTitle: string;
    pendingCount: number;
    manualReleaseBlocked: boolean;
    emptyStateMessage: string;
    currentEvent: ReleaseProductionCurrentEvent | null;
};

export const RELEASE_EMPTY_PRODUCTION_EVENT: ReleaseProductionEventSnapshot = {
    workAreaId: "",
    plateTitle: "Событие с машины",
    pendingCount: 0,
    manualReleaseBlocked: false,
    emptyStateMessage: "",
    currentEvent: null,
};
