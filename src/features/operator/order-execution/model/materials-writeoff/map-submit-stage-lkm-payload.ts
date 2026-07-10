import type { ApiSchemas } from "@/shared/api/schema";

const OK_ERROR_CODE = "OK";

export function mapSubmitStageLkmPayload(
    payload: ApiSchemas["SubmitStageLkmResponse"] | undefined,
): void {
    const fallbackMessage = "Не удалось отразить списание по этапу";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }
}
