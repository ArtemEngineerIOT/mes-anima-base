import type { OrderExecutionMachineStompState } from "./machine-stomp/order-execution-machine-data";

const STOMP_NUMBER_FORMAT = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
});

export type TechnologicalParamTagKey = string | readonly string[];

function pickNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return undefined;
}

function formatStompValue(value: unknown): string | null {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    if (typeof value === "boolean") {
        return value ? "Вкл" : "Выкл";
    }

    if (value === "true" || value === "false") {
        return value === "true" ? "Вкл" : "Выкл";
    }

    const number = pickNumber(value);
    if (number !== undefined) {
        return STOMP_NUMBER_FORMAT.format(number);
    }

    return String(value);
}

function normalizeTagKeys(tagKey: TechnologicalParamTagKey | undefined): string[] {
    if (!tagKey) {
        return [];
    }

    return (Array.isArray(tagKey) ? tagKey : [tagKey]).map((key) => key.trim()).filter(Boolean);
}

export function resolveTechnologicalParamTagValue(
    stompState: OrderExecutionMachineStompState,
    tagKey: TechnologicalParamTagKey | undefined,
    fallback: string,
): string {
    const keys = normalizeTagKeys(tagKey);
    if (keys.length === 0) {
        return fallback;
    }

    if (!stompState.isStompConnected || !stompState.hasReceivedTagsData) {
        return fallback;
    }

    const parts = keys
        .map((key) => formatStompValue(stompState.tagsSnapshot.fields[key]))
        .filter((value): value is string => value !== null);

    if (parts.length === 0) {
        return fallback;
    }

    return parts.join("-");
}

export function resolveTechnologicalParamStompValue(
    stompState: OrderExecutionMachineStompState,
    stompFieldKey: TechnologicalParamTagKey | undefined,
    fallbackCurrent: string,
): string {
    return resolveTechnologicalParamTagValue(stompState, stompFieldKey, fallbackCurrent);
}

export function resolveTechnologicalParamStompStandard(
    stompState: OrderExecutionMachineStompState,
    stompStandardFieldKey: TechnologicalParamTagKey | undefined,
    fallbackStandard: string,
): string {
    return resolveTechnologicalParamTagValue(stompState, stompStandardFieldKey, fallbackStandard);
}

export function resolveTechnologicalParamCurrentRollNumber(stompState: OrderExecutionMachineStompState): string {
    if (!stompState.isStompConnected || !stompState.hasReceivedTagsData) {
        return "—";
    }

    const reelCountmeter = stompState.tagsSnapshot.fields.reel_countmeter;
    const formatted = formatStompValue(reelCountmeter);
    return formatted ? `Рулон ${formatted} м` : "—";
}
