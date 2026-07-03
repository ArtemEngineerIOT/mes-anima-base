import type { ApiSchemas } from "@/shared/api/schema";

const OK_ERROR_CODE = "OK";

function pickString(row: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = row[key];
        if (typeof value === "string") {
            return value.trim();
        }
    }
    return "";
}

function pickNumber(row: Record<string, unknown>, ...keys: string[]): number | null {
    for (const key of keys) {
        const value = row[key];
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }
    }
    return null;
}

function mapOrderResultRow(row: Record<string, unknown>): MaterialOrderSubmitOrderResultRow {
    return {
        requestStatus: pickString(row, "request_status", "requestStatus"),
        errorMessage: pickString(row, "error_message", "errorMessage"),
        lineCount: pickNumber(row, "line_count", "lineCount"),
        external1sDocumentRef: pickString(row, "external_1s_document_ref", "external1sDocumentRef"),
        errorCode: pickString(row, "error_code", "errorCode"),
        operatorMessage: pickString(row, "operator_message", "operatorMessage"),
    };
}

export type MaterialOrderSubmitOrderResultRow = {
    requestStatus: string;
    errorMessage: string;
    lineCount: number | null;
    external1sDocumentRef: string;
    errorCode: string;
    operatorMessage: string;
};

export type MaterialOrderSubmitStatus = {
    visible: boolean;
    title: string;
    detail: string;
    materialDeliveryRequestId: string;
    orderResults: MaterialOrderSubmitOrderResultRow[];
};

export function mapMaterialOrderSubmitPayload(
    payload: ApiSchemas["MaterialOrderSubmitResponse"] | undefined,
): MaterialOrderSubmitStatus {
    const fallbackMessage = "Не удалось отправить заявку";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    const resultItem = wrapper.result?.[0] as Record<string, unknown> | undefined;
    if (!resultItem) {
        throw new Error(fallbackMessage);
    }

    const orderResultRaw = resultItem.order_result ?? resultItem.orderResult;
    const orderResultsRaw = resultItem.order_results ?? resultItem.orderResults;
    const orderResultRows = Array.isArray(orderResultRaw)
        ? orderResultRaw
        : Array.isArray(orderResultsRaw)
          ? orderResultsRaw
          : [];

    return {
        visible: Boolean(resultItem.submit_banner_visible ?? resultItem.submitBannerVisible),
        title:
            pickString(resultItem, "submit_banner_title", "submitBannerTitle") || "Заявка отправлена",
        detail: pickString(resultItem, "submit_banner_detail", "submitBannerDetail"),
        materialDeliveryRequestId: pickString(
            resultItem,
            "material_delivery_request_id",
            "materialDeliveryRequestId",
        ),
        orderResults: orderResultRows.map((row) => mapOrderResultRow(row as Record<string, unknown>)),
    };
}

/** @deprecated alias for {@link MaterialOrderSubmitStatus} */
export type MaterialOrderSubmitBanner = MaterialOrderSubmitStatus;
