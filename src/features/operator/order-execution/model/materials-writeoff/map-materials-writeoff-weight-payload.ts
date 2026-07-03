import type { ApiSchemas } from "@/shared/api/schema";

const OK_ERROR_CODE = "OK";

export type MaterialsWriteoffWeightCalculation = {
    weight: string;
    warningMessage?: string;
};

function pickNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return undefined;
}

function formatWeightKg(weightKg: number): string {
    return Number.isInteger(weightKg) ? String(weightKg) : String(weightKg);
}

export function mapMaterialsWriteoffWeightPayload(
    payload: ApiSchemas["OrderExecutionMaterialWriteoffWeightResponse"] | undefined,
): MaterialsWriteoffWeightCalculation {
    const fallbackMessage = "Не удалось рассчитать вес";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    const errorMessage = wrapper.error_message?.trim() || "";
    const result = (wrapper.result?.[0] ?? undefined) as Record<string, unknown> | undefined;
    const weightKg = pickNumber(result?.weight_kg ?? result?.weightKg ?? result?.weight);

    if (weightKg !== undefined) {
        const weight = formatWeightKg(weightKg);

        if (errorCode !== OK_ERROR_CODE) {
            return {
                weight,
                warningMessage: errorMessage || fallbackMessage,
            };
        }

        return { weight };
    }

    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(errorMessage || fallbackMessage);
    }

    throw new Error(fallbackMessage);
}
