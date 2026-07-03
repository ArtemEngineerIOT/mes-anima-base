import type { ApiSchemas } from "@/shared/api/schema";

const OK_ERROR_CODE = "OK";

function pickString(row: Record<string, unknown>, ...keys: string[]): string | undefined {
    for (const key of keys) {
        const value = row[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
}

export type ReleaseSubmitBlockResult = {
    message: string;
    requestStatus: string;
};

export function mapReleaseSubmitBlockPayload(
    payload: ApiSchemas["SubmitBlockResponse"] | undefined,
): ReleaseSubmitBlockResult {
    const fallbackMessage = "Не удалось передать блокировку";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    const result = (wrapper.result?.[0] ?? undefined) as Record<string, unknown> | undefined;
    const message =
        pickString(result ?? {}, "display_message", "displayMessage") || "Блокировка принята";
    const requestStatus = pickString(result ?? {}, "request_status", "requestStatus") || "ACCEPTED";

    return { message, requestStatus };
}
