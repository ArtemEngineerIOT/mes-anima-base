/**
 * Пути RPC REST как в esms-arena-app (`/v1/contexts/users.admin.models.rest/functions/...`).
 * Итоговый URL: `VITE_API_BASE_URL` + путь (например `/rest` + `/v1/contexts/...`).
 */
export const REST_FUNCTIONS_BASE = "/v1/contexts/users.admin.models.rest/functions" as const;

export const REST_FUNCTION_PATHS = {
    getSummaryData: `${REST_FUNCTIONS_BASE}/getSummaryData`,
    getProductionPlan: `${REST_FUNCTIONS_BASE}/getProductionPlan`,
    getProductionPlanMachines: `${REST_FUNCTIONS_BASE}/getProductionPlanMachines`,
    getMaterialOrderPlanStages: `${REST_FUNCTIONS_BASE}/getMaterialOrderPlanStages`,
    composeMaterialOrderLines: `${REST_FUNCTIONS_BASE}/composeMaterialOrderLines`,
    listMaterialOrderPickCandidates: `${REST_FUNCTIONS_BASE}/listMaterialOrderPickCandidates`,
    submitMaterialOrderRequest: `${REST_FUNCTIONS_BASE}/submitMaterialOrderRequest`,
    getMachineMaterialLocation: `${REST_FUNCTIONS_BASE}/getMachineMaterialLocation`,
    reprintRollLabelBySeries: `${REST_FUNCTIONS_BASE}/reprintRollLabelBySeries`,
    listBlockReasons: `${REST_FUNCTIONS_BASE}/listBlockReasons`,
    submitBlockRequest: `${REST_FUNCTIONS_BASE}/submitBlockRequest`,
    startProductionPlanStage: `${REST_FUNCTIONS_BASE}/startProductionPlanStage`,
    pauseProductionPlanStage: `${REST_FUNCTIONS_BASE}/pauseProductionPlanStage`,
    continueProductionPlanStage: `${REST_FUNCTIONS_BASE}/continueProductionPlanStage`,
    getOrderExecution: `${REST_FUNCTIONS_BASE}/getOrderExecution`,
    getOrderExecutionMaterialSeries: `${REST_FUNCTIONS_BASE}/getOrderExecutionMaterialSeries`,
    getActiveInputPrefill: `${REST_FUNCTIONS_BASE}/getActiveInputPrefill`,
    getOrderExecutionMaterialStageRegistry: `${REST_FUNCTIONS_BASE}/getOrderExecutionMaterialStageRegistry`,
    printOrderExecutionMaterialReturnLabel: `${REST_FUNCTIONS_BASE}/printOrderExecutionMaterialReturnLabel`,
    getOrderExecutionMaterialWriteoffWeight: `${REST_FUNCTIONS_BASE}/getOrderExecutionMaterialWriteoffWeight`,
    registerOrderExecutionMaterialReturn: `${REST_FUNCTIONS_BASE}/registerOrderExecutionMaterialReturn`,
    registerOrderExecutionMaterialFullWriteoff: `${REST_FUNCTIONS_BASE}/registerOrderExecutionMaterialFullWriteoff`,
    getReleaseFormInit: `${REST_FUNCTIONS_BASE}/getReleaseFormInit`,
    getBatchReleases: `${REST_FUNCTIONS_BASE}/getBatchReleases`,
    listStageInputRollsForWorkArea: `${REST_FUNCTIONS_BASE}/listStageInputRollsForWorkArea`,
    testGetListCylinders: `${REST_FUNCTIONS_BASE}/testGetListCylinders`,
    testGetStageInfo: `${REST_FUNCTIONS_BASE}/testGetStageInfo`,
    testMapParameters: `${REST_FUNCTIONS_BASE}/testMapParameters`,
    testPaintsRecipe: `${REST_FUNCTIONS_BASE}/testPaintsRecipe`,
    testGetLabelSection: `${REST_FUNCTIONS_BASE}/testGetLabelSection`,
    registerRelease: `${REST_FUNCTIONS_BASE}/registerRelease`,
    prepareReleaseLabel: `${REST_FUNCTIONS_BASE}/prepareReleaseLabel`,
    getArmExecutionMonitoringSummary: `${REST_FUNCTIONS_BASE}/getArmExecutionMonitoringSummary`,
    getArmExecutionMonitoringRollTables: `${REST_FUNCTIONS_BASE}/getArmExecutionMonitoringRollTables`,
    getArmExecutionMonitoringStageEvents: `${REST_FUNCTIONS_BASE}/getArmExecutionMonitoringStageEvents`,
    /** MES-профиль и роли после POST /auth (Bearer обязателен). */
    mesUserProfile: `${REST_FUNCTIONS_BASE}/mesUserProfile`,
} as const;
