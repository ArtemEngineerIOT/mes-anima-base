import { useCallback, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import {
    JB_CYLINDER_LIST_ROW_ID,
    JB_INK_RECIPE_ROW_ID,
    JB_PRINT_PARAMS_MAP_ROW_ID,
    JB_SECTION_LABEL_ROW_ID,
    JB_STAGE_INFO_ROW_ID,
} from "./constants";
import { mapJbLabelSectionPayload } from "./map-jb-label-section-payload";
import { mapJbMapParametersPayload } from "./map-jb-map-parameters-payload";
import { mapJbPaintsRecipePayload } from "./map-jb-paints-recipe-payload";
import { mapJbGetListCylindersPayload } from "./map-jb-get-list-cylinders-payload";
import { mapJbGetStageInfoPayload } from "./map-jb-get-stage-info-payload";

type UseJbCylinderReportPrintOptions = {
    workAreaId?: string;
};

export function useJbCylinderReportPrint({ workAreaId }: UseJbCylinderReportPrintOptions = {}) {
    const [printingRowId, setPrintingRowId] = useState<string | null>(null);
    const [printError, setPrintError] = useState<string | null>(null);

    const { mutateAsync: fetchListCylindersReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbGetListCylinders,
        {},
    );
    const { mutateAsync: fetchStageInfoReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbGetStageInfo,
        {},
    );
    const { mutateAsync: fetchMapParametersReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbMapParameters,
        {},
    );
    const { mutateAsync: fetchPaintsRecipeReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbPaintsRecipe,
        {},
    );
    const { mutateAsync: fetchLabelSectionReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbLabelSection,
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

    const printJbDocument = useCallback(
        async (rowId: string) => {
            setPrintingRowId(rowId);
            setPrintError(null);

            try {
                const trimmedWorkAreaId = workAreaId?.trim() ?? "";

                if (rowId === JB_CYLINDER_LIST_ROW_ID) {
                    if (!trimmedWorkAreaId) {
                        throw new Error("Не удалось определить workAreaId этапа");
                    }

                    const payload = await fetchListCylindersReportRef.current({
                        body: [{ workAreaId: trimmedWorkAreaId }],
                    });
                    const previewFilePath = mapJbGetListCylindersPayload(payload);
                    window.open(previewFilePath, "_blank", "noopener,noreferrer");
                    return;
                }

                if (rowId === JB_STAGE_INFO_ROW_ID) {
                    if (!trimmedWorkAreaId) {
                        throw new Error("Не удалось определить workAreaId этапа");
                    }

                    const payload = await fetchStageInfoReportRef.current({
                        body: [{ workAreaId: trimmedWorkAreaId }],
                    });
                    const previewFilePath = mapJbGetStageInfoPayload(payload);
                    window.open(previewFilePath, "_blank", "noopener,noreferrer");
                    return;
                }

                if (rowId === JB_PRINT_PARAMS_MAP_ROW_ID) {
                    if (!trimmedWorkAreaId) {
                        throw new Error("Не удалось определить workAreaId этапа");
                    }

                    const payload = await fetchMapParametersReportRef.current({
                        body: [{ workAreaId: trimmedWorkAreaId }],
                    });
                    const previewFilePath = mapJbMapParametersPayload(payload);
                    window.open(previewFilePath, "_blank", "noopener,noreferrer");
                    return;
                }

                if (rowId === JB_INK_RECIPE_ROW_ID) {
                    if (!trimmedWorkAreaId) {
                        throw new Error("Не удалось определить workAreaId этапа");
                    }

                    const payload = await fetchPaintsRecipeReportRef.current({
                        body: [{ workAreaId: trimmedWorkAreaId }],
                    });
                    const previewFilePath = mapJbPaintsRecipePayload(payload);
                    window.open(previewFilePath, "_blank", "noopener,noreferrer");
                    return;
                }

                if (rowId === JB_SECTION_LABEL_ROW_ID) {
                    if (!trimmedWorkAreaId) {
                        throw new Error("Не удалось определить workAreaId этапа");
                    }

                    const payload = await fetchLabelSectionReportRef.current({
                        body: [{ workAreaId: trimmedWorkAreaId }],
                    });
                    const previewFilePath = mapJbLabelSectionPayload(payload);
                    window.open(previewFilePath, "_blank", "noopener,noreferrer");
                    return;
                }
            } catch (error) {
                setPrintError(error instanceof Error ? error.message : "Не удалось напечатать отчёт");
            } finally {
                setPrintingRowId(null);
            }
        },
        [workAreaId],
    );

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
