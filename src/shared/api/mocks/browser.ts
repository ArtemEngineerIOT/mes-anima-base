import { setupWorker } from "msw/browser";
import { authHandlers } from "./handlers/auth";
import { mesUserProfileFunctionHandlers } from "./handlers/mes-user-profile-function";
import { orderExecutionHandlers } from "./handlers/order-execution";
import { orderExecutionResolveBarcodeOnStageHandlers } from "./handlers/order-execution-resolve-barcode-on-stage";
import { orderExecutionSubmitMoveToUnwindHandlers } from "./handlers/order-execution-submit-move-to-unwind";
import { orderExecutionStageRollRegistryHandlers } from "./handlers/order-execution-stage-roll-registry";
import { orderExecutionStageRollPresenceHandlers } from "./handlers/order-execution-stage-roll-presence";
import { orderExecutionMaterialReturnLabelHandlers } from "./handlers/order-execution-material-return-label";
import { convertConsumedLengthToWeightHandlers } from "./handlers/convert-consumed-length-to-weight";
import { listReturnWarehousesHandlers } from "./handlers/list-return-warehouses";
import { submitPartialReturnHandlers } from "./handlers/submit-partial-return";
import { submitFullWriteOffHandlers } from "./handlers/submit-full-write-off";
import { submitStageLkmHandlers } from "./handlers/submit-stage-lkm";
import { orderExecutionReleaseHandlers } from "./handlers/order-execution-release";
import { orderExecutionEventRollWriteOffHandlers } from "./handlers/order-execution-event-roll-write-off";
import { orderExecutionMonitoringHandlers } from "./handlers/order-execution-monitoring";
import { orderExecutionStageProgressHandlers } from "./handlers/order-execution-stage-progress";
import { orderExecutionUnprocessedSignalsSummaryHandlers } from "./handlers/order-execution-unprocessed-signals-summary";
import { orderExecutionLastProcessParamsSlicesHandlers } from "./handlers/order-execution-last-process-params-slices";
import { orderExecutionProcessControlHandlers } from "./handlers/order-execution-process-control";
import { orderExecutionProductionEventWizardHandlers } from "./handlers/order-execution-production-event-wizard";
import { orderExecutionListCylindersReportHandlers } from "./handlers/order-execution-list-cylinders-report";
import { orderExecutionStageInfoReportHandlers } from "./handlers/order-execution-stage-info-report";
import { orderExecutionMapParametersReportHandlers } from "./handlers/order-execution-map-parameters-report";
import { orderExecutionPaintsRecipeReportHandlers } from "./handlers/order-execution-paints-recipe-report";
import { orderExecutionLabelSectionReportHandlers } from "./handlers/order-execution-label-section-report";
import { orderExecutionStageCompletionInitHandlers } from "./handlers/order-execution-stage-completion-init";
import { orderExecutionStageCompletionSubmitHandlers } from "./handlers/order-execution-stage-completion-submit";
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
    ...orderExecutionResolveBarcodeOnStageHandlers,
    ...orderExecutionSubmitMoveToUnwindHandlers,
    ...orderExecutionStageRollRegistryHandlers,
    ...orderExecutionStageRollPresenceHandlers,
    ...orderExecutionMaterialReturnLabelHandlers,
    ...convertConsumedLengthToWeightHandlers,
    ...listReturnWarehousesHandlers,
    ...submitPartialReturnHandlers,
    ...submitFullWriteOffHandlers,
    ...submitStageLkmHandlers,
    ...orderExecutionReleaseHandlers,
    ...orderExecutionEventRollWriteOffHandlers,
    ...orderExecutionMonitoringHandlers,
    ...orderExecutionStageProgressHandlers,
    ...orderExecutionUnprocessedSignalsSummaryHandlers,
    ...orderExecutionLastProcessParamsSlicesHandlers,
    ...orderExecutionProcessControlHandlers,
    ...orderExecutionProductionEventWizardHandlers,
    ...orderExecutionListCylindersReportHandlers,
    ...orderExecutionStageInfoReportHandlers,
    ...orderExecutionMapParametersReportHandlers,
    ...orderExecutionPaintsRecipeReportHandlers,
    ...orderExecutionLabelSectionReportHandlers,
    ...orderExecutionStageCompletionInitHandlers,
    ...orderExecutionStageCompletionSubmitHandlers,
);
