import type { ApiSchemas } from "@/shared/api/schema";

import type { BlockReasonRow } from "./material-order-workspace-mock";

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

function mapBlockReasonRow(row: Record<string, unknown>): BlockReasonRow | null {
    const code = pickString(row, "reason_code", "reasonCode");
    const title = pickString(row, "reason_label", "reasonLabel");
    if (!code || !title) {
        return null;
    }

    return { reasonCode: code, reasonLabel: title };
}

export function mapMaterialOrderBlockReasonsPayload(
    payload: ApiSchemas["ListBlockReasonsResponse"] | undefined,
): BlockReasonRow[] {
    const fallbackMessage = "Не удалось загрузить причины блокировки";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }

    return (wrapper.result ?? [])
        .map((row) => mapBlockReasonRow(row as Record<string, unknown>))
        .filter((row): row is BlockReasonRow => row !== null);
}
