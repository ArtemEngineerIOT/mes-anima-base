import { setupWorker } from "msw/browser";
import { authHandlers } from "./handlers/auth";
import { clientGetEnvironmentHandlers } from "./handlers/client-get-environment";
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
import { orderExecutionSaveManualProcessParamsHandlers } from "./handlers/order-execution-save-manual-process-params";
import { orderExecutionProcessControlHandlers } from "./handlers/order-execution-process-control";
import { orderExecutionProductionEventWizardHandlers } from "./handlers/order-execution-production-event-wizard";
import { orderExecutionPrintSheet2ReportHandlers } from "./handlers/order-execution-print-sheet2-report";
import { orderExecutionPrintSheet1ReportHandlers } from "./handlers/order-execution-print-sheet1-report";
import { orderExecutionPrintSheet3ReportHandlers } from "./handlers/order-execution-print-sheet3-report";
import { orderExecutionMapColorControlReportHandlers } from "./handlers/order-execution-map-color-control-report";
import { orderExecutionFullPrintReportHandlers } from "./handlers/order-execution-full-print-report";
import { orderExecutionProcessControlReportHandlers } from "./handlers/order-execution-process-control-report";
import { orderExecutionPrintSheet4ReportHandlers } from "./handlers/order-execution-print-sheet4-report";
import { orderExecutionPrintSheet6ReportHandlers } from "./handlers/order-execution-print-sheet6-report";
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
    ...clientGetEnvironmentHandlers,
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
    ...orderExecutionSaveManualProcessParamsHandlers,
    ...orderExecutionProcessControlHandlers,
    ...orderExecutionProductionEventWizardHandlers,
    ...orderExecutionPrintSheet2ReportHandlers,
    ...orderExecutionPrintSheet1ReportHandlers,
    ...orderExecutionPrintSheet3ReportHandlers,
    ...orderExecutionMapColorControlReportHandlers,
    ...orderExecutionFullPrintReportHandlers,
    ...orderExecutionProcessControlReportHandlers,
    ...orderExecutionPrintSheet4ReportHandlers,
    ...orderExecutionPrintSheet6ReportHandlers,
    ...orderExecutionStageCompletionInitHandlers,
    ...orderExecutionStageCompletionSubmitHandlers,
);
