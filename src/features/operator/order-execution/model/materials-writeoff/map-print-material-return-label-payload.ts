import type { ApiSchemas } from "@/shared/api/schema";
import { resolveReportPreviewUrl } from "@/shared/lib/resolve-report-preview-url";

const OK_ERROR_CODE = "OK";

function pickPreviewFilePath(result: Record<string, unknown> | undefined): string {
    if (!result) {
        return "";
    }

    const snake = result.report_preview_file_path;
    if (typeof snake === "string" && snake.trim()) {
        return snake.trim();
    }

    const camel = result.reportPreviewFilePath;
    if (typeof camel === "string" && camel.trim()) {
        return camel.trim();
    }

    return "";
}

export function mapPrintMaterialReturnLabelPayload(
    payload: ApiSchemas["OrderExecutionMaterialReturnLabelResponse"] | undefined,
): string {
    const fallbackMessage = "Не удалось получить этикетку для печати";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    const result = (wrapper.result?.[0] ?? undefined) as Record<string, unknown> | undefined;

    if (result?.report_make_succeeded === false || result?.reportMakeSucceeded === false) {
        const makeMessage =
            (typeof result.report_make_message === "string" && result.report_make_message.trim()) ||
            (typeof result.reportMakeMessage === "string" && result.reportMakeMessage.trim()) ||
            fallbackMessage;
        throw new Error(makeMessage);
    }

    const previewFilePath = pickPreviewFilePath(result);
    if (!previewFilePath) {
        throw new Error(fallbackMessage);
    }

    return resolveReportPreviewUrl(previewFilePath);
}
