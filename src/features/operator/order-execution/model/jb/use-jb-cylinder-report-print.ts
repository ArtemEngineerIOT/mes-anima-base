import { useCallback, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useSession } from "@/shared/model/session";

import {
    JB_COLOR_CONTROL_MAP_ROW_ID,
    JB_CYLINDER_LIST_ROW_ID,
    JB_INK_RECIPE_ROW_ID,
    JB_PRINT_PARAMS_MAP_ROW_ID,
    JB_PROCESS_CONTROL_ROW_ID,
    JB_SECTION_LABEL_ROW_ID,
    JB_STAGE_INFO_ROW_ID,
    JB_WHOLE_DOCUMENT_ROW_ID,
} from "./constants";
import { mapJbFullPrintPayload } from "./map-jb-full-print-payload";
import { mapJbLabelSectionPayload } from "./map-jb-label-section-payload";
import { mapJbMapParametersPayload } from "./map-jb-map-parameters-payload";
import { mapJbMapPrintPayload } from "./map-jb-map-print-payload";
import { mapJbPaintsRecipePayload } from "./map-jb-paints-recipe-payload";
import { mapJbProcessControlPayload } from "./map-jb-process-control-payload";
import { mapJbPrintSheet2Payload } from "./map-jb-print-sheet2-payload";
import { mapJbPrintSheet1Payload } from "./map-jb-print-sheet1-payload";

type UseJbCylinderReportPrintOptions = {
    workAreaId?: string;
    workAreaStart?: string;
    order?: string;
};

export function useJbCylinderReportPrint({
    workAreaId,
    workAreaStart,
    order,
}: UseJbCylinderReportPrintOptions = {}) {
    const { clientEnvironment } = useSession();
    const [printingRowId, setPrintingRowId] = useState<string | null>(null);
    const [printError, setPrintError] = useState<string | null>(null);

    const { mutateAsync: fetchPrintSheet2Report } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbPrintSheet2,
        {},
    );
    const { mutateAsync: fetchPrintSheet1Report } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbPrintSheet1,
        {},
    );
    const { mutateAsync: fetchMapParametersReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbMapParameters,
        {},
    );
    const { mutateAsync: fetchMapPrintReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbMapPrint,
        {},
    );
    const { mutateAsync: fetchFullPrintReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbFullPrint,
        {},
    );
    const { mutateAsync: fetchProcessControlReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbProcessControl,
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

    const fetchPrintSheet2ReportRef = useRef(fetchPrintSheet2Report);
    fetchPrintSheet2ReportRef.current = fetchPrintSheet2Report;
    const fetchPrintSheet1ReportRef = useRef(fetchPrintSheet1Report);
    fetchPrintSheet1ReportRef.current = fetchPrintSheet1Report;
    const fetchMapParametersReportRef = useRef(fetchMapParametersReport);
    fetchMapParametersReportRef.current = fetchMapParametersReport;
    const fetchMapPrintReportRef = useRef(fetchMapPrintReport);
    fetchMapPrintReportRef.current = fetchMapPrintReport;
    const fetchFullPrintReportRef = useRef(fetchFullPrintReport);
    fetchFullPrintReportRef.current = fetchFullPrintReport;
    const fetchProcessControlReportRef = useRef(fetchProcessControlReport);
    fetchProcessControlReportRef.current = fetchProcessControlReport;
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
                const trimmedWorkAreaStart = workAreaStart?.trim() ?? "";
                const trimmedOrder = order?.trim() ?? "";
                const pathFolder = clientEnvironment?.tempFilesFolder?.trim() ?? "";

                if (rowId === JB_CYLINDER_LIST_ROW_ID) {
                    if (!trimmedOrder || trimmedOrder === "—") {
                        throw new Error("Не удалось определить номер заказа");
                    }
                    if (!pathFolder) {
                        throw new Error("Не удалось определить pathFolder окружения клиента");
                    }

                    const payload = await fetchPrintSheet2ReportRef.current({
                        body: [{ order: trimmedOrder }],
                    });
                    const previewFilePath = mapJbPrintSheet2Payload(payload, pathFolder);
                    window.open(previewFilePath, "_blank", "noopener,noreferrer");
                    return;
                }

                if (rowId === JB_STAGE_INFO_ROW_ID) {
                    if (!trimmedOrder || trimmedOrder === "—") {
                        throw new Error("Не удалось определить номер заказа");
                    }
                    if (!trimmedWorkAreaStart) {
                        throw new Error("Не удалось определить workAreaStart этапа");
                    }
                    if (!pathFolder) {
                        throw new Error("Не удалось определить pathFolder окружения клиента");
                    }

                    const payload = await fetchPrintSheet1ReportRef.current({
                        body: [
                            {
                                order: trimmedOrder,
                                workAreaStart: trimmedWorkAreaStart,
                            },
                        ],
                    });
                    const previewFilePath = mapJbPrintSheet1Payload(payload, pathFolder);
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

                if (rowId === JB_COLOR_CONTROL_MAP_ROW_ID) {
                    if (!trimmedWorkAreaId) {
                        throw new Error("Не удалось определить workAreaId этапа");
                    }

                    const payload = await fetchMapPrintReportRef.current({
                        body: [{ workAreaId: trimmedWorkAreaId }],
                    });
                    const previewFilePath = mapJbMapPrintPayload(payload);
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

                if (rowId === JB_PROCESS_CONTROL_ROW_ID) {
                    if (!trimmedWorkAreaId) {
                        throw new Error("Не удалось определить workAreaId этапа");
                    }

                    const payload = await fetchProcessControlReportRef.current({
                        body: [{ workAreaId: trimmedWorkAreaId }],
                    });
                    const previewFilePath = mapJbProcessControlPayload(payload);
                    window.open(previewFilePath, "_blank", "noopener,noreferrer");
                    return;
                }

                if (rowId === JB_WHOLE_DOCUMENT_ROW_ID) {
                    if (!trimmedWorkAreaId) {
                        throw new Error("Не удалось определить workAreaId этапа");
                    }

                    const payload = await fetchFullPrintReportRef.current({
                        body: [{ workAreaId: trimmedWorkAreaId }],
                    });
                    const previewFilePath = mapJbFullPrintPayload(payload);
                    window.open(previewFilePath, "_blank", "noopener,noreferrer");
                    return;
                }
            } catch (error) {
                setPrintError(error instanceof Error ? error.message : "Не удалось напечатать отчёт");
            } finally {
                setPrintingRowId(null);
            }
        },
        [clientEnvironment?.tempFilesFolder, order, workAreaId, workAreaStart],
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
