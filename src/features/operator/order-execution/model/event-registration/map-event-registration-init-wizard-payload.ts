import type { ApiSchemas } from "@/shared/api/schema";

import {
    assertEventRegistrationRpcOk,
    pickBoolean,
    pickNumber,
    pickString,
} from "./map-event-registration-rpc-utils";
import type {
    EventCardColorCatalogItem,
    EventCodeDefinition,
    EventRegistrationSnapshot,
    EventRollCatalogItem,
    EventSide,
    SetupRunTag,
    UnprocessedMachineEvent,
} from "./types";

export type EventRegistrationInitWizardMapped = {
    wizardSessionId: string;
    snapshot: EventRegistrationSnapshot;
};

function inferSignalType(description: string, row: Record<string, unknown>): UnprocessedMachineEvent["signalType"] {
    const explicit = pickString(row.signal_type ?? row.signalType)?.toLowerCase();
    if (explicit === "stop" || explicit === "knife" || explicit === "other") {
        return explicit;
    }

    const lowered = description.toLowerCase();
    if (lowered.includes("останов")) {
        return "stop";
    }
    if (lowered.includes("нож") || lowered.includes("удар")) {
        return "knife";
    }
    return "other";
}

function mapEventCodeRow(row: Record<string, unknown>): EventCodeDefinition | null {
    const code = pickNumber(row.code ?? row.event_code);
    if (code == null) {
        return null;
    }

    const label = pickString(row.name ?? row.label ?? row.event_name) ?? String(code);
    const requiresSetupRuns = pickBoolean(row.requires_setup_runs ?? row.requiresSetupRuns);

    return {
        code,
        label,
        requiresTime: pickBoolean(row.requires_time ?? row.requiresTime),
        requiresMeterage: pickBoolean(
            row.requires_length ?? row.requires_meterage ?? row.requiresLength ?? row.requiresMeterage,
        ),
        requiresComment: pickBoolean(row.requires_comment ?? row.requiresComment),
        ...(requiresSetupRuns ? { requiresSetupRuns: true } : {}),
    };
}

function mapSetupRunTagRow(row: Record<string, unknown> | string): SetupRunTag | null {
    if (typeof row === "string") {
        const tag = row.trim();
        if (!tag) {
            return null;
        }
        return { tag, label: tag };
    }

    const tag = pickString(row.tag ?? row.code ?? row.value);
    if (!tag) {
        return null;
    }

    return {
        tag,
        label: pickString(row.label ?? row.name) ?? tag,
    };
}

function mapUnprocessedSignalRow(row: Record<string, unknown>): UnprocessedMachineEvent | null {
    const id = pickString(row.signal_id ?? row.signalId ?? row.id);
    if (!id) {
        return null;
    }

    const description = pickString(row.signal_name ?? row.signalName ?? row.name) ?? "—";
    const detectedAt = pickString(row.time_start ?? row.timeStart ?? row.detected_at ?? row.detectedAt) ?? "";
    const endedAt = pickString(row.time_end ?? row.timeEnd ?? row.ended_at ?? row.endedAt) ?? detectedAt;

    return {
        id,
        description,
        detectedAt,
        endedAt,
        signalType: inferSignalType(description, row),
        ...(pickString(row.length_start_m ?? row.meter_from ?? row.meterFrom)
            ? { meterFrom: pickString(row.length_start_m ?? row.meter_from ?? row.meterFrom) }
            : {}),
        ...(pickString(row.length_end_m ?? row.meter_to ?? row.meterTo)
            ? { meterTo: pickString(row.length_end_m ?? row.meter_to ?? row.meterTo) }
            : {}),
    };
}

export function mapUnprocessedSignals(
    value: unknown,
    fallback: UnprocessedMachineEvent[] = [],
): UnprocessedMachineEvent[] {
    if (!Array.isArray(value)) {
        return fallback;
    }

    return readObjectArray(value)
        .map(mapUnprocessedSignalRow)
        .filter((row): row is UnprocessedMachineEvent => row !== null);
}

function mapRollCatalogItem(row: Record<string, unknown>): EventRollCatalogItem | null {
    const ref = pickString(row.ref ?? row.material_roll_ref ?? row.materialRollRef);
    const label = pickString(row.label);
    if (!ref && !label) {
        return null;
    }

    if (ref && label) {
        return { ref, label };
    }

    if (ref) {
        return { ref, label: ref };
    }

    return { ref: label!, label: label! };
}

function mapCardColorCatalogItem(
    row: Record<string, unknown> | string,
): EventCardColorCatalogItem | null {
    if (typeof row === "string") {
        const label = row.trim();
        if (!label) return null;
        return { code: label.toUpperCase(), label };
    }

    const code = pickString(row.code)?.toUpperCase();
    const label = pickString(row.label ?? row.name);
    if (!code && !label) {
        return null;
    }

    return {
        code: code ?? label!.toUpperCase(),
        label: label ?? code!,
    };
}

function mapSideOption(row: Record<string, unknown> | string): EventSide | null {
    if (typeof row === "string") {
        const normalized = row.trim().toUpperCase();
        if (normalized === "PM") return "PM";
        if (normalized === "PASSER") return "Passer";
        return null;
    }

    const code = pickString(row.code)?.toUpperCase();
    if (code === "PM") return "PM";
    if (code === "PASSER") return "Passer";
    return null;
}

function readObjectArray(value: unknown): Record<string, unknown>[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
}

function readSetupRunTags(value: unknown): SetupRunTag[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => mapSetupRunTagRow(item as Record<string, unknown> | string))
        .filter((item): item is SetupRunTag => item !== null);
}

function readDefaultsRow(value: unknown): Record<string, unknown> {
    if (Array.isArray(value)) {
        const first = value[0];
        return typeof first === "object" && first !== null ? (first as Record<string, unknown>) : {};
    }

    if (typeof value === "object" && value !== null) {
        return value as Record<string, unknown>;
    }

    return {};
}

export function mapEventRegistrationInitWizardPayload(
    payload: ApiSchemas["OrderExecutionProductionEventWizardInitResponse"] | undefined,
    fallback: EventRegistrationSnapshot,
): EventRegistrationInitWizardMapped {
    const fallbackMessage = "Не удалось загрузить данные регистрации события";
    const wrapper = payload?.[0];
    assertEventRegistrationRpcOk(wrapper, fallbackMessage);

    const resultItem = (wrapper?.result?.[0] ?? {}) as Record<string, unknown>;
    const wizardSessionId =
        pickString(resultItem.wizard_session_id ?? resultItem.wizardSessionId) ?? "";

    const setupRunTags = readSetupRunTags(resultItem.setup_run_tags ?? resultItem.setupRunTags);

    const eventCodes = readObjectArray(resultItem.event_codes ?? resultItem.eventCodes)
        .map(mapEventCodeRow)
        .filter((row): row is EventCodeDefinition => row !== null);

    const unprocessedEvents = mapUnprocessedSignals(
        resultItem.unprocessed_signals ?? resultItem.unprocessedSignals,
        fallback.unprocessedEvents,
    );

    const removedRollCatalog = readObjectArray(resultItem.rolls_removed_pipeline ?? resultItem.rollsRemovedPipeline)
        .map(mapRollCatalogItem)
        .filter((item): item is EventRollCatalogItem => item !== null);
    const registeredRollCatalog = readObjectArray(
        resultItem.rolls_registered_pipeline ?? resultItem.rollsRegisteredPipeline,
    )
        .map(mapRollCatalogItem)
        .filter((item): item is EventRollCatalogItem => item !== null);
    const rollCatalog = [...removedRollCatalog, ...registeredRollCatalog].filter(
        (item, index, items) => items.findIndex((entry) => entry.ref === item.ref) === index,
    );
    const rollOptions = rollCatalog.map((item) => item.label);

    const defaults = readDefaultsRow(resultItem.defaults);
    const scrapRollDefault =
        pickString(defaults.material_roll_ref_removed ?? defaults.materialRollRefRemoved) ??
        rollCatalog[0]?.label ??
        fallback.scrapRollDefault;
    const activeRollDefault =
        pickString(defaults.material_roll_ref_registered ?? defaults.materialRollRefRegistered) ??
        registeredRollCatalog[0]?.label ??
        fallback.activeRollDefault;

    const lineCount =
        pickNumber(resultItem.line_count ?? resultItem.lineCount) ?? fallback.lineCount;

    const lineNumberOptions = readObjectArray(resultItem.line_numbers ?? resultItem.lineNumbers)
        .map((row) => pickString(row.line_number ?? row.lineNumber))
        .filter((lineNumber): lineNumber is string => Boolean(lineNumber));

    const sides = readObjectArray(resultItem.sides)
        .map(mapSideOption)
        .filter((side): side is EventSide => side !== null);
    const sideOptions = sides.length > 0 ? [...new Set(sides)] : fallback.sideOptions;
    const sideDefault = sides[0] ?? fallback.sideDefault;

    const cardColorCatalog = readObjectArray(resultItem.card_colors ?? resultItem.cardColors)
        .map(mapCardColorCatalogItem)
        .filter((item): item is EventCardColorCatalogItem => item !== null);
    const cardColorOptions = cardColorCatalog.map((item) => item.label);

    return {
        wizardSessionId,
        snapshot: {
            ...fallback,
            eventCodes: eventCodes.length > 0 ? eventCodes : fallback.eventCodes,
            setupRunTags: setupRunTags.length > 0 ? setupRunTags : fallback.setupRunTags,
            unprocessedEvents: unprocessedEvents.length > 0 ? unprocessedEvents : fallback.unprocessedEvents,
            rollOptions: rollOptions.length > 0 ? rollOptions : fallback.rollOptions,
            rollCatalog: rollCatalog.length > 0 ? rollCatalog : fallback.rollCatalog,
            scrapRollDefault,
            activeRollDefault,
            lineCount,
            lineNumberOptions: lineNumberOptions.length > 0 ? lineNumberOptions : fallback.lineNumberOptions,
            sideOptions,
            sideDefault,
            cardColorOptions: cardColorOptions.length > 0 ? cardColorOptions : fallback.cardColorOptions,
            cardColorCatalog: cardColorCatalog.length > 0 ? cardColorCatalog : fallback.cardColorCatalog,
        },
    };
}
