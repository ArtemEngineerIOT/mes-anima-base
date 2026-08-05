import type { EventRegistrationDraft, UnprocessedMachineEvent } from "./types";

/**
 * Дата/время сигнала → `HH:MM` для `<input type="time">`.
 * Поддерживает:
 * - `23.07.2026 20:35:22`
 * - `2026-07-22 16:14:19`
 * - `03-11-2028 10:15:00`
 * - `16:14` / `16:14:19`
 */
export function parseSignalDateToTime(signalDate: string): string {
    const trimmed = signalDate.trim();
    if (!trimmed || trimmed === "—") {
        return "";
    }

    const datetimeMatch = trimmed.match(
        /(?:\d{2}[./-]\d{2}[./-]\d{4}|\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?/,
    );
    if (datetimeMatch) {
        const [, hh, mi] = datetimeMatch;
        return `${hh}:${mi}`;
    }

    const timeOnlyMatch = trimmed.match(/^(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/);
    if (timeOnlyMatch) {
        const [, hh, mi] = timeOnlyMatch;
        return `${hh}:${mi}`;
    }

    return "";
}

/** Нормализует значение черновика под `<input type="time">` (`HH:MM`). */
export function normalizeTimeInputValue(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
        return "";
    }

    return parseSignalDateToTime(trimmed);
}

/** @deprecated Используйте `parseSignalDateToTime` для шага 2 */
export function parseSignalDateToDatetimeLocal(signalDate: string): string {
    const match = signalDate.match(/^(\d{2})[./-](\d{2})[./-](\d{4}) (\d{2}):(\d{2})/);
    if (!match) return "";

    const [, dd, mm, yyyy, hh, mi] = match;
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function pickMeterValue(fields: Record<string, unknown>): string | undefined {
    const raw =
        fields.current_length_m ??
        fields.currentLengthM ??
        fields.reel_countmeter ??
        fields.meters;

    if (typeof raw === "number" && Number.isFinite(raw)) {
        return Number.isInteger(raw) ? String(raw) : raw.toFixed(2).replace(/\.?0+$/, "");
    }

    if (typeof raw === "string" && raw.trim() && !Number.isNaN(Number(raw))) {
        return raw.trim();
    }

    return undefined;
}

type Step2MeterTimePrefill = Partial<
    Pick<EventRegistrationDraft, "meterFrom" | "meterTo" | "timeFrom" | "timeTo">
>;

/** Prefill шага 2 из выбранного сигнала: метраж (`length_*`) и время (`time_*`). */
export function buildStep2PrefillFromSignal(signal: UnprocessedMachineEvent): Step2MeterTimePrefill {
    return {
        meterFrom: signal.meterFrom?.trim() ?? "",
        meterTo: signal.meterTo?.trim() ?? "",
        timeFrom: parseSignalDateToTime(signal.detectedAt),
        timeTo: parseSignalDateToTime(signal.endedAt),
    };
}

export function buildStep2SensorPrefill(params: {
    signal: UnprocessedMachineEvent | null;
    sensorFields?: Record<string, unknown>;
}): Step2MeterTimePrefill {
    if (params.signal) {
        return buildStep2PrefillFromSignal(params.signal);
    }

    const patch: Step2MeterTimePrefill = {};
    const currentMeter = params.sensorFields ? pickMeterValue(params.sensorFields) : undefined;
    if (currentMeter) {
        patch.meterTo = currentMeter;
    }

    return patch;
}

export function mergeStep2SensorPrefill(
    draft: EventRegistrationDraft,
    prefill: Step2MeterTimePrefill,
    options?: { overwrite?: boolean },
): EventRegistrationDraft {
    if (options?.overwrite) {
        return {
            ...draft,
            ...(prefill.meterFrom !== undefined ? { meterFrom: prefill.meterFrom } : {}),
            ...(prefill.meterTo !== undefined ? { meterTo: prefill.meterTo } : {}),
            ...(prefill.timeFrom !== undefined ? { timeFrom: prefill.timeFrom } : {}),
            ...(prefill.timeTo !== undefined ? { timeTo: prefill.timeTo } : {}),
        };
    }

    return {
        ...draft,
        meterFrom: draft.meterFrom || prefill.meterFrom || "",
        meterTo: draft.meterTo || prefill.meterTo || "",
        timeFrom: draft.timeFrom || prefill.timeFrom || "",
        timeTo: draft.timeTo || prefill.timeTo || "",
    };
}

export function resolveRemoveScrapDefault(signal: UnprocessedMachineEvent | null): boolean {
    if (!signal) return false;
    return signal.signalType === "stop";
}
