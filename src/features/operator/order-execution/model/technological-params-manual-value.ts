import type { TechnologicalParamTagKey } from "./resolve-technological-param-stomp-value";

function tagKeysCount(tagKey: TechnologicalParamTagKey | undefined): number {
    if (!tagKey) {
        return 0;
    }

    return (Array.isArray(tagKey) ? tagKey : [tagKey]).map((key) => key.trim()).filter(Boolean).length;
}

function countCompositeValueParts(value: string): number {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "—") {
        return 0;
    }

    return trimmed.split("-").map((part) => part.trim()).filter((part) => part !== "").length;
}

/** Сколько отдельных значений в строке («0-0» → 2, «0-0-0-0» → 4). */
export function resolveTechnologicalParamPartsCount(options: {
    stompFieldKey?: TechnologicalParamTagKey;
    stompStandardFieldKey?: TechnologicalParamTagKey;
    standardValue?: string;
    currentValue?: string;
}): number {
    const fromField = tagKeysCount(options.stompFieldKey);
    if (fromField > 1) {
        return fromField;
    }

    const fromStandardKey = tagKeysCount(options.stompStandardFieldKey);
    if (fromStandardKey > 1) {
        return fromStandardKey;
    }

    const fromStandard = countCompositeValueParts(options.standardValue ?? "");
    if (fromStandard > 1) {
        return fromStandard;
    }

    const fromCurrent = countCompositeValueParts(options.currentValue ?? "");
    if (fromCurrent > 1) {
        return fromCurrent;
    }

    return 1;
}

export function splitTechnologicalParamManualParts(value: string, partsCount: number): string[] {
    const count = Math.max(1, partsCount);
    if (!value.trim()) {
        return Array.from({ length: count }, () => "");
    }

    const rawParts = value.split("-").map((part) => part.trim());

    return Array.from({ length: count }, (_, index) => rawParts[index] ?? "");
}

export function joinTechnologicalParamManualParts(parts: string[]): string {
    if (parts.every((part) => !part.trim())) {
        return "";
    }

    return parts.map((part) => part.trim()).join("-");
}

/** Оставляет только цифры и один десятичный разделитель (`,` → `.`). */
export function sanitizeTechnologicalParamNumericInput(value: string): string {
    const cleaned = value.replace(/[^\d.,]/g, "");
    const separatorIndex = cleaned.search(/[.,]/);
    if (separatorIndex === -1) {
        return cleaned;
    }

    const integerPart = cleaned.slice(0, separatorIndex);
    const fractionalPart = cleaned.slice(separatorIndex + 1).replace(/[.,]/g, "");
    return `${integerPart}.${fractionalPart}`;
}
