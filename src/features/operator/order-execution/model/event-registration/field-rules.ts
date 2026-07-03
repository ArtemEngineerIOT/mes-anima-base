import type { EventCodeDefinition, EventRegistrationDraft, ScrapRemovalMode } from "./types";

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

export function createEmptyDraft(snapshot: {
    scrapRollDefault: string;
    activeRollDefault: string;
}): EventRegistrationDraft {
    return {
        eventCode: null,
        subCode: "",
        removeScrapImmediately: null,
        meterFrom: "",
        meterTo: "",
        timeFrom: "",
        timeTo: "",
        wholeStage: false,
        roll: snapshot.scrapRollDefault,
        comment: "",
        side: "",
        lineNumbers: "",
        startCard: "",
        endCard: "",
    };
}

export function draftToJournalDetails(
    draft: EventRegistrationDraft,
    code: EventCodeDefinition,
    mode: ScrapRemovalMode,
): Record<string, string> {
    const details: Record<string, string> = {
        "Код": `${code.code} — ${code.label}`,
        "Удалять брак сразу": mode === "immediate" ? "Да" : "Нет",
    };

    if (draft.subCode) details["Подкод"] = draft.subCode;
    if (draft.wholeStage) details["Весь этап"] = "Да";

    if (!draft.wholeStage) {
        if (draft.meterFrom || draft.meterTo) {
            details["Метраж"] = `${draft.meterFrom || "—"} — ${draft.meterTo || "—"}`;
        }
        if (draft.timeFrom || draft.timeTo) {
            details["Время"] = `${draft.timeFrom || "—"} — ${draft.timeTo || "—"}`;
        }
    }

    details["Рулон"] = draft.roll || "—";
    if (draft.comment) details["Комментарий"] = draft.comment;

    if (mode === "deferred") {
        if (draft.side) details["Сторона"] = draft.side;
        if (draft.lineNumbers) details["Ряд"] = draft.lineNumbers;
        if (draft.startCard) details["Карточка начала"] = draft.startCard;
        if (draft.endCard) details["Карточка конца"] = draft.endCard;
    }

    return details;
}
