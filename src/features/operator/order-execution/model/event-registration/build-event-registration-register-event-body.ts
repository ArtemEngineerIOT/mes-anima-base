import type { ApiSchemas } from "@/shared/api/schema";

import { EVENT_REGISTRATION_ALL_LINES_VALUE } from "./line-number-options";
import type {
    EventRegistrationDraft,
    EventRegistrationSnapshot,
    EventSide,
    ScrapRemovalMode,
    UnprocessedMachineEvent,
} from "./types";

export type EventRegistrationRegisterEventBodyParams = {
    wizardSessionId: string;
    workAreaId: string;
    operatorRef?: string;
    draft: EventRegistrationDraft;
    scrapMode: ScrapRemovalMode;
    selectedSignal: UnprocessedMachineEvent | null;
    snapshot: Pick<EventRegistrationSnapshot, "rollCatalog" | "cardColorCatalog">;
};

const SETUP_RUN_EVENT_CODE = 120;

function resolveMaterialRollRef(
    rollLabel: string,
    catalog: EventRegistrationSnapshot["rollCatalog"],
): string {
    const trimmed = rollLabel.trim();
    if (!trimmed) return "";

    const match = catalog.find((item) => item.label === trimmed || item.ref === trimmed);
    if (match) return match.ref;

    const dashIdx = trimmed.indexOf(" — ");
    if (dashIdx > 0) {
        return trimmed.slice(0, dashIdx).trim();
    }

    return trimmed;
}

function resolveCardCode(
    label: string,
    catalog: EventRegistrationSnapshot["cardColorCatalog"],
): string {
    const trimmed = label.trim();
    if (!trimmed) return "";

    const match = catalog.find((item) => item.label === trimmed || item.code === trimmed);
    return match?.code ?? trimmed;
}

function mapSideWire(side: EventSide | ""): string {
    if (side === "Passer") return "PASSER";
    return side;
}

function mapLineSelection(selectedLines: readonly string[]): string {
    if (selectedLines.includes(EVENT_REGISTRATION_ALL_LINES_VALUE)) {
        return "ALL";
    }

    return selectedLines.join(",");
}

function parseLengthM(value: string): number | undefined {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const numeric = Number(trimmed.replace(",", "."));
    if (!Number.isFinite(numeric)) {
        return undefined;
    }

    return Number(numeric.toFixed(3));
}

function extractDatePart(value: string | undefined): string | null {
    const trimmed = value?.trim();
    if (!trimmed) return null;

    const match = trimmed.match(/(\d{2})-(\d{2})-(\d{4})/);
    if (!match) return null;

    return `${match[3]}-${match[2]}-${match[1]}`;
}

function normalizeTimePart(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const parts = trimmed.split(":");
    if (parts.length === 2) {
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
    }

    if (parts.length >= 3) {
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}`;
    }

    return trimmed;
}

function formatDateTimeForApi(timeValue: string, fallbackDateSource?: string): string | undefined {
    const trimmed = timeValue.trim();
    if (!trimmed) return undefined;

    if (trimmed.includes("-") && trimmed.includes(" ")) {
        return trimmed;
    }

    const datePart =
        extractDatePart(fallbackDateSource) ??
        (() => {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, "0");
            const dd = String(now.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
        })();

    return `${datePart} ${normalizeTimePart(trimmed)}`;
}

function appendMeterAndTimeFields(
    item: Record<string, unknown>,
    draft: EventRegistrationDraft,
    signalDateSource: string | undefined,
    includeWhenWholeStage: boolean,
) {
    if (draft.wholeStage && !includeWhenWholeStage) {
        return;
    }

    const lengthStartM = parseLengthM(draft.meterFrom);
    const lengthEndM = parseLengthM(draft.meterTo);
    const timeStart = formatDateTimeForApi(draft.timeFrom, signalDateSource);
    const timeEnd = formatDateTimeForApi(draft.timeTo, signalDateSource);

    if (lengthStartM !== undefined) {
        item.lengthStartM = lengthStartM;
    }
    if (lengthEndM !== undefined) {
        item.lengthEndM = lengthEndM;
    }
    if (timeStart) {
        item.timeStart = timeStart;
    }
    if (timeEnd) {
        item.timeEnd = timeEnd;
    }
}

export function buildEventRegistrationRegisterEventBody(
    params: EventRegistrationRegisterEventBodyParams,
): ApiSchemas["OrderExecutionProductionEventRegisterRequest"] {
    const { draft, scrapMode, selectedSignal, snapshot } = params;
    const signalDateSource = [selectedSignal?.detectedAt, selectedSignal?.endedAt].find(
        (value) => Boolean(value?.trim()) && value !== "—",
    );
    const removeImmediately = scrapMode === "immediate";
    const eventCode = draft.eventCode == null ? "" : String(draft.eventCode);

    const signalIds = selectedSignal?.id?.trim() ?? "";
    const setupRunTags =
        eventCode === String(SETUP_RUN_EVENT_CODE)
            ? draft.setupRuns.map((tag) => tag.trim()).filter(Boolean).join(",")
            : "";
    const wholeStage = removeImmediately ? draft.wholeStage : false;
    const spliceReasonCode = "";

    const item: Record<string, unknown> = {
        wizardSessionId: params.wizardSessionId,
        workAreaId: params.workAreaId,
        eventCode,
        removeImmediately,
        signalIds,
        setupRunTags,
        wholeStage,
        spliceReasonCode,
        materialRollRef: resolveMaterialRollRef(draft.roll, snapshot.rollCatalog),
    };

    const operatorRef = params.operatorRef?.trim();
    if (operatorRef) {
        item.operatorRef = operatorRef;
    }

    const comment = draft.comment.trim();
    if (comment) {
        item.comment = comment;
    }

    if (removeImmediately) {
        appendMeterAndTimeFields(item, draft, signalDateSource, false);
    } else {
        appendMeterAndTimeFields(item, draft, signalDateSource, true);

        const side = mapSideWire(draft.side);
        if (side) {
            item.side = side;
        }

        const lineSelection = mapLineSelection(draft.selectedLines);
        if (lineSelection) {
            item.lineSelection = lineSelection;
        }

        const cardStart = resolveCardCode(draft.startCard, snapshot.cardColorCatalog);
        if (cardStart) {
            item.cardStart = cardStart;
        }

        const cardEnd = resolveCardCode(draft.endCard, snapshot.cardColorCatalog);
        if (cardEnd) {
            item.cardEnd = cardEnd;
        }
    }

    return [item as ApiSchemas["OrderExecutionProductionEventRegisterRequest"][number]];
}
