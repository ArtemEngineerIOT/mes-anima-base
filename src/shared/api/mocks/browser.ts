import { setupWorker } from "msw/browser";
import { authHandlers } from "./handlers/auth";
import { mesUserProfileFunctionHandlers } from "./handlers/mes-user-profile-function";
import { orderExecutionHandlers } from "./handlers/order-execution";
import { orderExecutionMaterialSeriesHandlers } from "./handlers/order-execution-material-series";
import { orderExecutionActiveInputPrefillHandlers } from "./handlers/order-execution-active-input-prefill";
import { orderExecutionMaterialStageRegistryHandlers } from "./handlers/order-execution-material-stage-registry";
import { orderExecutionMaterialReturnLabelHandlers } from "./handlers/order-execution-material-return-label";
import { orderExecutionMaterialWriteoffWeightHandlers } from "./handlers/order-execution-material-writeoff-weight";
import { orderExecutionMaterialReturnHandlers } from "./handlers/order-execution-material-return";
import { orderExecutionMaterialFullWriteoffHandlers } from "./handlers/order-execution-material-full-writeoff";
import { orderExecutionReleaseHandlers } from "./handlers/order-execution-release";
import { orderExecutionMonitoringHandlers } from "./handlers/order-execution-monitoring";
import { orderExecutionProductionEventWizardHandlers } from "./handlers/order-execution-production-event-wizard";
import { orderExecutionListCylindersReportHandlers } from "./handlers/order-execution-list-cylinders-report";
import { orderExecutionStageInfoReportHandlers } from "./handlers/order-execution-stage-info-report";
import { orderExecutionMapParametersReportHandlers } from "./handlers/order-execution-map-parameters-report";
import { orderExecutionPaintsRecipeReportHandlers } from "./handlers/order-execution-paints-recipe-report";
import { orderExecutionLabelSectionReportHandlers } from "./handlers/order-execution-label-section-report";
import { productionPlanHandlers } from "./handlers/production-plan";
import { materialOrderPlanStagesHandlers } from "./handlers/material-order-plan-stages";
import { materialOrderComposeHandlers } from "./handlers/material-order-compose";
import { materialOrderPickCandidatesHandlers } from "./handlers/material-order-pick-candidates";
import { materialOrderBlockReasonsHandlers } from "./handlers/material-order-block-reasons";
import { materialOrderLocationHandlers } from "./handlers/material-order-location";
import { materialOrderLocationRollLabelHandlers } from "./handlers/material-order-location-roll-label";
import { materialOrderSubmitBlockHandlers } from "./handlers/material-order-submit-block";
import { materialOrderSubmitHandlers } from "./handlers/material-order-submit";
import { summaryHandlers } from "./handlers/summary";

export const worker = setupWorker(
    ...summaryHandlers,
    ...authHandlers,
    ...mesUserProfileFunctionHandlers,
    ...productionPlanHandlers,
    ...materialOrderPlanStagesHandlers,
    ...materialOrderComposeHandlers,
    ...materialOrderPickCandidatesHandlers,
    ...materialOrderLocationHandlers,
    ...materialOrderLocationRollLabelHandlers,
    ...materialOrderBlockReasonsHandlers,
    ...materialOrderSubmitBlockHandlers,
    ...materialOrderSubmitHandlers,
    ...orderExecutionHandlers,
    ...orderExecutionMaterialSeriesHandlers,
    ...orderExecutionActiveInputPrefillHandlers,
    ...orderExecutionMaterialStageRegistryHandlers,
    ...orderExecutionMaterialReturnLabelHandlers,
    ...orderExecutionMaterialWriteoffWeightHandlers,
    ...orderExecutionMaterialReturnHandlers,
    ...orderExecutionMaterialFullWriteoffHandlers,
    ...orderExecutionReleaseHandlers,
    ...orderExecutionMonitoringHandlers,
    ...orderExecutionProductionEventWizardHandlers,
    ...orderExecutionListCylindersReportHandlers,
    ...orderExecutionStageInfoReportHandlers,
    ...orderExecutionMapParametersReportHandlers,
    ...orderExecutionPaintsRecipeReportHandlers,
    ...orderExecutionLabelSectionReportHandlers,
);
