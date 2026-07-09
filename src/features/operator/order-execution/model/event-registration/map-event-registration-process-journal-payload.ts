import type { ApiSchemas } from "@/shared/api/schema";

import { assertEventRegistrationRpcOk, pickNumber, pickString } from "./map-event-registration-rpc-utils";
import type { ProcessJournalDetailRow, ProcessJournalEntry } from "./types";

function readObjectArray(value: unknown): Record<string, unknown>[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
}

function readDetailsObject(value: unknown): Record<string, unknown> {
    if (Array.isArray(value)) {
        const first = value[0];
        return typeof first === "object" && first !== null ? (first as Record<string, unknown>) : {};
    }

    if (typeof value === "object" && value !== null) {
        return value as Record<string, unknown>;
    }

    return {};
}

function pushDetail(
    rows: ProcessJournalDetailRow[],
    parameter: string,
    value: string | undefined,
): void {
    const trimmed = value?.trim();
    if (!trimmed) {
        return;
    }

    rows.push({ parameter, value: trimmed });
}

function mapJournalDetailRows(detailsSource: Record<string, unknown>): ProcessJournalDetailRow[] {
    const rows: ProcessJournalDetailRow[] = [];

    pushDetail(rows, "Рулон", pickString(detailsSource.material_roll_label ?? detailsSource.materialRollLabel));
    pushDetail(
        rows,
        "Начало, м",
        pickString(detailsSource.length_start_m ?? detailsSource.lengthStartM),
    );
    pushDetail(rows, "Конец, м", pickString(detailsSource.length_end_m ?? detailsSource.lengthEndM));
    pushDetail(rows, "Сторона", pickString(detailsSource.side_label ?? detailsSource.sideLabel));
    pushDetail(
        rows,
        "Ряд",
        pickString(detailsSource.line_selection_label ?? detailsSource.lineSelectionLabel),
    );
    pushDetail(
        rows,
        "Карточка 1",
        pickString(detailsSource.card_start_label ?? detailsSource.cardStartLabel),
    );
    pushDetail(rows, "Карточка 2", pickString(detailsSource.card_end_label ?? detailsSource.cardEndLabel));
    pushDetail(
        rows,
        "Статус",
        pickString(detailsSource.registration_status_label ?? detailsSource.registrationStatusLabel),
    );
    pushDetail(
        rows,
        "Заезды на настройку",
        pickString(detailsSource.setup_run_tags_label ?? detailsSource.setupRunTagsLabel),
    );
    pushDetail(rows, "Комментарий", pickString(detailsSource.comment));

    return rows;
}

function mapJournalRow(row: Record<string, unknown>, index: number): ProcessJournalEntry | null {
    const eventCodeLabel = pickString(row.event_code_label ?? row.eventCodeLabel);
    if (!eventCodeLabel) {
        return null;
    }

    const id =
        pickString(row.production_event_id ?? row.productionEventId ?? row.id) ?? `journal-row-${index}`;
    const timeStart = pickString(row.time_start_label ?? row.timeStartLabel) ?? "—";
    const timeEnd = pickString(row.time_end_label ?? row.timeEndLabel) ?? "—";
    const lengthM = pickString(row.length_m ?? row.lengthM) ?? "—";
    const detailsSource = {
        ...row,
        ...readDetailsObject(row.details),
    };
    const details = mapJournalDetailRows(detailsSource);

    return {
        id,
        eventCodeLabel,
        timeStart,
        timeEnd,
        lengthM,
        details: details.length > 0 ? details : undefined,
    };
}

export type EventRegistrationProcessJournalMapped = {
    journal: ProcessJournalEntry[];
    totalLengthM: number | null;
};

export function mapEventRegistrationProcessJournalPayload(
    payload: ApiSchemas["OrderExecutionProductionEventProcessJournalResponse"] | undefined,
    fallback: ProcessJournalEntry[],
): EventRegistrationProcessJournalMapped {
    const fallbackMessage = "Не удалось загрузить журнал процесса";
    const wrapper = payload?.[0];
    assertEventRegistrationRpcOk(wrapper, fallbackMessage);

    const resultItem = (wrapper?.result?.[0] ?? {}) as Record<string, unknown>;
    const journalRows = readObjectArray(resultItem.journal_rows ?? resultItem.journalRows)
        .map(mapJournalRow)
        .filter((row): row is ProcessJournalEntry => row !== null);

    return {
        journal: journalRows.length > 0 ? journalRows : fallback,
        totalLengthM: pickNumber(resultItem.total_length_m ?? resultItem.totalLengthM),
    };
}
