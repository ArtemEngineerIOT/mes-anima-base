import type {
    EventCodeDefinition,
    EventRegistrationDraft,
    ProcessJournalDetailRow,
    ScrapRemovalMode,
    SetupRunTag,
} from "./types";
import { formatSelectedLinesSummary } from "./line-number-options";

export function findEventCode(codes: EventCodeDefinition[], code: number | null): EventCodeDefinition | null {
    if (code == null) return null;
    return codes.find((c) => c.code === code) ?? null;
}

export function getScrapRemovalMode(draft: EventRegistrationDraft): ScrapRemovalMode | null {
    if (draft.removeScrapImmediately == null) return null;
    return draft.removeScrapImmediately ? "immediate" : "deferred";
}

export function isFieldRequired(
    code: EventCodeDefinition | null,
    field: "time" | "meterage" | "comment",
    draft: EventRegistrationDraft,
): boolean {
    if (!code) return false;
    if (draft.wholeStage && (field === "time" || field === "meterage")) return false;

    switch (field) {
        case "time":
            return code.requiresTime;
        case "meterage":
            return code.requiresMeterage;
        case "comment":
            return code.requiresComment;
    }
}

function hasText(value: string): boolean {
    return value.trim().length > 0;
}

/** Поля метража на шаге 2 обязательны, если не включён «Весь этап» (immediate). */
export function areStep2MeterFieldsRequired(
    draft: EventRegistrationDraft,
    mode: ScrapRemovalMode,
): boolean {
    return !draft.wholeStage || mode === "deferred";
}

export function areStep2TimeFieldsRequired(
    draft: EventRegistrationDraft,
    mode: ScrapRemovalMode,
): boolean {
    return areStep2MeterFieldsRequired(draft, mode);
}

/** Оставляет в вводе только цифры и один десятичный разделитель. */
export function sanitizeMeterInput(value: string): string {
    const cleaned = value.replace(/[^\d.,]/g, "");
    const separatorIndex = cleaned.search(/[.,]/);
    if (separatorIndex === -1) {
        return cleaned;
    }

    const integerPart = cleaned.slice(0, separatorIndex);
    const fractionalPart = cleaned.slice(separatorIndex + 1).replace(/[.,]/g, "");
    return `${integerPart}.${fractionalPart}`;
}

export function isValidMeterValue(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) {
        return false;
    }

    const normalized = trimmed.replace(",", ".");
    if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
        return false;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) && parsed >= 0;
}

export function getMeterFieldError(value: string, required: boolean): string | undefined {
    if (!required || !hasText(value)) {
        return undefined;
    }
    if (!isValidMeterValue(value)) {
        return "Введите число";
    }
    return undefined;
}

export function formatSetupRunLabels(
    tags: readonly SetupRunTag[],
    selected: readonly string[],
): string {
    return selected
        .map((tag) => tags.find((item) => item.tag === tag)?.label ?? tag)
        .join(", ");
}

/** Подпись кода в списке выбора: `120 — Описание…` */
export function formatEventCodeOptionLabel(code: number, label: string, maxLength = 48): string {
    const text = `${code} — ${label}`;
    if (text.length <= maxLength) {
        return text;
    }
    return `${text.slice(0, maxLength - 3)}...`;
}

/** Подпись события в заголовке блока: полное описание */
export function formatEventCodeHeaderLabel(code: number, label: string): string {
    return `${code} — ${label}`;
}

export function canProceedEventRegistrationStep1(draft: EventRegistrationDraft): boolean {
    return draft.eventCode != null;
}

export function canProceedEventRegistrationStep2(
    draft: EventRegistrationDraft,
    code: EventCodeDefinition | null,
): boolean {
    const mode = getScrapRemovalMode(draft);
    if (!code || mode == null) return false;

    if (!hasText(draft.roll)) return false;
    if (!hasText(draft.comment)) return false;

    const metersRequired = areStep2MeterFieldsRequired(draft, mode);
    const timesRequired = areStep2TimeFieldsRequired(draft, mode);

    if (metersRequired) {
        if (!isValidMeterValue(draft.meterFrom) || !isValidMeterValue(draft.meterTo)) {
            return false;
        }
    }

    if (timesRequired) {
        if (!hasText(draft.timeFrom) || !hasText(draft.timeTo)) return false;
    }

    if (mode === "deferred") {
        if (!draft.side) return false;
        if (draft.selectedLines.length === 0) return false;
        if (!hasText(draft.startCard) || !hasText(draft.endCard)) return false;
    }

    return true;
}

export function createEmptyDraft(snapshot: {
    scrapRollDefault: string;
    activeRollDefault: string;
}): EventRegistrationDraft {
    return {
        eventCode: null,
        setupRuns: [],
        removeScrapImmediately: false,
        meterFrom: "",
        meterTo: "",
        timeFrom: "",
        timeTo: "",
        wholeStage: false,
        roll: snapshot.scrapRollDefault,
        comment: "",
        side: "",
        selectedLines: [],
        startCard: "",
        endCard: "",
    };
}

export function draftToJournalDetailRows(
    draft: EventRegistrationDraft,
    mode: ScrapRemovalMode,
    setupRunTags: readonly SetupRunTag[] = [],
): ProcessJournalDetailRow[] {
    const rows: ProcessJournalDetailRow[] = [];

    rows.push({ parameter: "Рулон", value: draft.roll || "—" });

    if (!draft.wholeStage) {
        if (draft.meterFrom) {
            rows.push({ parameter: "Начало, м", value: draft.meterFrom });
        }
        if (draft.meterTo) {
            rows.push({ parameter: "Конец, м", value: draft.meterTo });
        }
    }

    if (mode === "deferred") {
        if (draft.side) {
            rows.push({ parameter: "Сторона", value: draft.side });
        }
        if (draft.selectedLines.length > 0) {
            rows.push({ parameter: "Ряд", value: formatSelectedLinesSummary(draft.selectedLines) });
        }
        if (draft.startCard) {
            rows.push({ parameter: "Карточка 1", value: draft.startCard });
        }
        if (draft.endCard) {
            rows.push({ parameter: "Карточка 2", value: draft.endCard });
        }
    }

    rows.push({
        parameter: "Статус",
        value: mode === "immediate" ? "Удален" : "Зарегистрирован",
    });

    if (draft.setupRuns.length > 0) {
        rows.push({
            parameter: "Заезды на настройку",
            value: formatSetupRunLabels(setupRunTags, draft.setupRuns),
        });
    }

    if (draft.comment) {
        rows.push({ parameter: "Комментарий", value: draft.comment });
    }

    return rows;
}
