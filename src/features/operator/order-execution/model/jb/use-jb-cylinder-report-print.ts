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
import { mapJbMapColorControlPayload } from "./map-jb-map-color-control-payload";
import { mapJbProcessControlPayload } from "./map-jb-process-control-payload";
import { mapJbPrintSheet1Payload } from "./map-jb-print-sheet1-payload";
import { mapJbPrintSheet2Payload } from "./map-jb-print-sheet2-payload";
import { mapJbPrintSheet3Payload } from "./map-jb-print-sheet3-payload";
import { mapJbPrintSheet4Payload } from "./map-jb-print-sheet4-payload";
import { mapJbPrintSheet6Payload } from "./map-jb-print-sheet6-payload";

type UseJbCylinderReportPrintOptions = {
    workAreaId?: string;
    workAreaStart?: string;
    order?: string;
};

/** Открывает вкладку синхронно (до await), чтобы браузер не блокировал popup. */
function openPreviewTab(): Window | null {
    return window.open("about:blank", "_blank");
}

function navigatePreviewTab(tab: Window | null, url: string) {
    if (tab && !tab.closed) {
        tab.location.href = url;
        return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
}

function closePreviewTab(tab: Window | null) {
    if (tab && !tab.closed) {
        tab.close();
    }
}

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
    const { mutateAsync: fetchPrintSheet3Report } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbPrintSheet3,
        {},
    );
    const { mutateAsync: fetchMapColorControlReport } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbMapColorControl,
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
    const { mutateAsync: fetchPrintSheet4Report } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbPrintSheet4,
        {},
    );
    const { mutateAsync: fetchPrintSheet6Report } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.jbPrintSheet6,
        {},
    );

    const fetchPrintSheet2ReportRef = useRef(fetchPrintSheet2Report);
    fetchPrintSheet2ReportRef.current = fetchPrintSheet2Report;
    const fetchPrintSheet1ReportRef = useRef(fetchPrintSheet1Report);
    fetchPrintSheet1ReportRef.current = fetchPrintSheet1Report;
    const fetchPrintSheet3ReportRef = useRef(fetchPrintSheet3Report);
    fetchPrintSheet3ReportRef.current = fetchPrintSheet3Report;
    const fetchMapColorControlReportRef = useRef(fetchMapColorControlReport);
    fetchMapColorControlReportRef.current = fetchMapColorControlReport;
    const fetchFullPrintReportRef = useRef(fetchFullPrintReport);
    fetchFullPrintReportRef.current = fetchFullPrintReport;
    const fetchProcessControlReportRef = useRef(fetchProcessControlReport);
    fetchProcessControlReportRef.current = fetchProcessControlReport;
    const fetchPrintSheet4ReportRef = useRef(fetchPrintSheet4Report);
    fetchPrintSheet4ReportRef.current = fetchPrintSheet4Report;
    const fetchPrintSheet6ReportRef = useRef(fetchPrintSheet6Report);
    fetchPrintSheet6ReportRef.current = fetchPrintSheet6Report;

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

                    const previewTab = openPreviewTab();
                    try {
                        const payload = await fetchPrintSheet2ReportRef.current({
                            body: [{ order: trimmedOrder }],
                        });
                        const previewFilePath = mapJbPrintSheet2Payload(payload, pathFolder);
                        navigatePreviewTab(previewTab, previewFilePath);
                    } catch (error) {
                        closePreviewTab(previewTab);
                        throw error;
                    }
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

                    const previewTab = openPreviewTab();
                    try {
                        const payload = await fetchPrintSheet1ReportRef.current({
                            body: [
                                {
                                    order: trimmedOrder,
                                    workAreaStart: trimmedWorkAreaStart,
                                },
                            ],
                        });
                        const previewFilePath = mapJbPrintSheet1Payload(payload, pathFolder);
                        navigatePreviewTab(previewTab, previewFilePath);
                    } catch (error) {
                        closePreviewTab(previewTab);
                        throw error;
                    }
                    return;
                }

                if (rowId === JB_PRINT_PARAMS_MAP_ROW_ID) {
                    if (!trimmedOrder || trimmedOrder === "—") {
                        throw new Error("Не удалось определить номер заказа");
                    }
                    if (!trimmedWorkAreaStart) {
                        throw new Error("Не удалось определить workAreaStart этапа");
                    }
                    if (!pathFolder) {
                        throw new Error("Не удалось определить pathFolder окружения клиента");
                    }

                    const previewTab = openPreviewTab();
                    try {
                        const payload = await fetchPrintSheet3ReportRef.current({
                            body: [
                                {
                                    order: trimmedOrder,
                                    workAreaStart: trimmedWorkAreaStart,
                                },
                            ],
                        });
                        const previewFilePath = mapJbPrintSheet3Payload(payload, pathFolder);
                        navigatePreviewTab(previewTab, previewFilePath);
                    } catch (error) {
                        closePreviewTab(previewTab);
                        throw error;
                    }
                    return;
                }

                if (rowId === JB_COLOR_CONTROL_MAP_ROW_ID) {
                    if (!trimmedOrder || trimmedOrder === "—") {
                        throw new Error("Не удалось определить номер заказа");
                    }
                    if (!pathFolder) {
                        throw new Error("Не удалось определить pathFolder окружения клиента");
                    }

                    const previewTab = openPreviewTab();
                    try {
                        const payload = await fetchMapColorControlReportRef.current({
                            body: [{ order: trimmedOrder }],
                        });
                        const previewFilePath = mapJbMapColorControlPayload(payload, pathFolder);
                        navigatePreviewTab(previewTab, previewFilePath);
                    } catch (error) {
                        closePreviewTab(previewTab);
                        throw error;
                    }
                    return;
                }

                if (rowId === JB_INK_RECIPE_ROW_ID) {
                    if (!trimmedOrder || trimmedOrder === "—") {
                        throw new Error("Не удалось определить номер заказа");
                    }
                    if (!pathFolder) {
                        throw new Error("Не удалось определить pathFolder окружения клиента");
                    }

                    const previewTab = openPreviewTab();
                    try {
                        const payload = await fetchPrintSheet4ReportRef.current({
                            body: [{ order: trimmedOrder }],
                        });
                        const previewFilePath = mapJbPrintSheet4Payload(payload, pathFolder);
                        navigatePreviewTab(previewTab, previewFilePath);
                    } catch (error) {
                        closePreviewTab(previewTab);
                        throw error;
                    }
                    return;
                }

                if (rowId === JB_SECTION_LABEL_ROW_ID) {
                    if (!trimmedOrder || trimmedOrder === "—") {
                        throw new Error("Не удалось определить номер заказа");
                    }
                    if (!pathFolder) {
                        throw new Error("Не удалось определить pathFolder окружения клиента");
                    }

                    const previewTab = openPreviewTab();
                    try {
                        const payload = await fetchPrintSheet6ReportRef.current({
                            body: [{ order: trimmedOrder }],
                        });
                        const previewFilePath = mapJbPrintSheet6Payload(payload, pathFolder);
                        navigatePreviewTab(previewTab, previewFilePath);
                    } catch (error) {
                        closePreviewTab(previewTab);
                        throw error;
                    }
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
