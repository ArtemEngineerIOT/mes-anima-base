import { useCallback, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { JB_CYLINDER_LIST_ROW_ID, JB_INK_RECIPE_ROW_ID, JB_PRINT_PARAMS_MAP_ROW_ID, JB_SECTION_LABEL_ROW_ID, JB_STAGE_INFO_ROW_ID } from "./constants";
import { mapTestGetLabelSectionPayload } from "./map-test-get-label-section-payload";
import { mapTestGetListCylindersPayload } from "./map-test-get-list-cylinders-payload";
import { mapTestGetStageInfoPayload } from "./map-test-get-stage-info-payload";
import { mapTestMapParametersPayload } from "./map-test-map-parameters-payload";
import { mapTestPaintsRecipePayload } from "./map-test-paints-recipe-payload";

export function useJbCylinderReportPrint() {
    const [printingRowId, setPrintingRowId] = useState<string | null>(null);
    const [printError, setPrintError] = useState<string | null>(null);

    const { mutateAsync: fetchListCylindersReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.testGetListCylinders,
        {},
    );
    const { mutateAsync: fetchStageInfoReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.testGetStageInfo,
        {},
    );
    const { mutateAsync: fetchMapParametersReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.testMapParameters,
        {},
    );
    const { mutateAsync: fetchPaintsRecipeReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.testPaintsRecipe,
        {},
    );
    const { mutateAsync: fetchLabelSectionReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.testGetLabelSection,
        {},
    );

    const fetchListCylindersReportRef = useRef(fetchListCylindersReport);
    fetchListCylindersReportRef.current = fetchListCylindersReport;
    const fetchStageInfoReportRef = useRef(fetchStageInfoReport);
    fetchStageInfoReportRef.current = fetchStageInfoReport;
    const fetchMapParametersReportRef = useRef(fetchMapParametersReport);
    fetchMapParametersReportRef.current = fetchMapParametersReport;
    const fetchPaintsRecipeReportRef = useRef(fetchPaintsRecipeReport);
    fetchPaintsRecipeReportRef.current = fetchPaintsRecipeReport;
    const fetchLabelSectionReportRef = useRef(fetchLabelSectionReport);
    fetchLabelSectionReportRef.current = fetchLabelSectionReport;

    const printJbDocument = useCallback(async (rowId: string) => {
        setPrintingRowId(rowId);
        setPrintError(null);

        try {
            if (rowId === JB_CYLINDER_LIST_ROW_ID) {
                const payload = await fetchListCylindersReportRef.current({ body: [] });
                const previewFilePath = mapTestGetListCylindersPayload(payload);
                window.open(previewFilePath, "_blank", "noopener,noreferrer");
                return;
            }

            if (rowId === JB_STAGE_INFO_ROW_ID) {
                const payload = await fetchStageInfoReportRef.current({ body: [] });
                const previewFilePath = mapTestGetStageInfoPayload(payload);
                window.open(previewFilePath, "_blank", "noopener,noreferrer");
                return;
            }

            if (rowId === JB_PRINT_PARAMS_MAP_ROW_ID) {
                const payload = await fetchMapParametersReportRef.current({ body: [] });
                const previewFilePath = mapTestMapParametersPayload(payload);
                window.open(previewFilePath, "_blank", "noopener,noreferrer");
                return;
            }

            if (rowId === JB_INK_RECIPE_ROW_ID) {
                const payload = await fetchPaintsRecipeReportRef.current({ body: [] });
                const previewFilePath = mapTestPaintsRecipePayload(payload);
                window.open(previewFilePath, "_blank", "noopener,noreferrer");
                return;
            }

            if (rowId === JB_SECTION_LABEL_ROW_ID) {
                const payload = await fetchLabelSectionReportRef.current({ body: [] });
                const previewFilePath = mapTestGetLabelSectionPayload(payload);
                window.open(previewFilePath, "_blank", "noopener,noreferrer");
                return;
            }
        } catch (error) {
            setPrintError(error instanceof Error ? error.message : "Не удалось напечатать отчёт");
        } finally {
            setPrintingRowId(null);
        }
    }, []);

    const printCylinderList = useCallback(() => {
        void printJbDocument(JB_CYLINDER_LIST_ROW_ID);
    }, [printJbDocument]);

    const printStageInfo = useCallback(() => {
        void printJbDocument(JB_STAGE_INFO_ROW_ID);
    }, [printJbDocument]);

    return {
        printJbDocument,
        printCylinderList,
        printStageInfo,
        printingRowId,
        printError,
    };
}
