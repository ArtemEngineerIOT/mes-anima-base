import type { EventRegistrationDraft, UnprocessedMachineEvent } from "./types";

/** «03-11-2028 10:15:00» / «2026-07-06 11:42:50» → `HH:MM:SS` */
export function parseSignalDateToTime(signalDate: string): string {
    const match = signalDate.match(/(?:\d{2}-\d{2}-\d{4}|\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!match) {
        const timeOnly = signalDate.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
        if (!timeOnly) return "";
        const [, hh, mi, ss] = timeOnly;
        return `${hh}:${mi}:${ss ?? "00"}`;
    }

    const [, hh, mi, ss] = match;
    return `${hh}:${mi}:${ss ?? "00"}`;
}

/** @deprecated Используйте `parseSignalDateToTime` для шага 2 */
export function parseSignalDateToDatetimeLocal(signalDate: string): string {
    const match = signalDate.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/);
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

export function buildStep2SensorPrefill(params: {
    signal: UnprocessedMachineEvent | null;
    sensorFields?: Record<string, unknown>;
}): Partial<Pick<EventRegistrationDraft, "meterFrom" | "meterTo" | "timeFrom" | "timeTo">> {
    const patch: Partial<Pick<EventRegistrationDraft, "meterFrom" | "meterTo" | "timeFrom" | "timeTo">> = {};

    if (params.signal) {
        const timeFrom = parseSignalDateToTime(params.signal.detectedAt);
        const timeTo = parseSignalDateToTime(params.signal.endedAt);
        if (timeFrom) patch.timeFrom = timeFrom;
        if (timeTo) patch.timeTo = timeTo;
        if (params.signal.meterFrom) patch.meterFrom = params.signal.meterFrom;
        if (params.signal.meterTo) patch.meterTo = params.signal.meterTo;
    }

    const currentMeter = params.sensorFields ? pickMeterValue(params.sensorFields) : undefined;
    if (currentMeter && !patch.meterTo) {
        patch.meterTo = currentMeter;
    }

    return patch;
}

export function mergeStep2SensorPrefill(
    draft: EventRegistrationDraft,
    prefill: Partial<Pick<EventRegistrationDraft, "meterFrom" | "meterTo" | "timeFrom" | "timeTo">>,
): EventRegistrationDraft {
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
