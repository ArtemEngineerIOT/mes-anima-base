import type { ApiSchemas } from "@/shared/api/schema";

import {
    assertReleaseRpcOk,
    formatReleaseUomLabel,
    pickBoolean,
    pickNumber,
    pickRawString,
    pickString,
} from "./release/map-release-rpc-utils";
import type {
    StageBlockingIssue,
    StageCompletionSnapshot,
    StageEventDetailRow,
    StageEventJournalRow,
    StageIncomingRollRow,
    StagePendingEventRow,
    StageReleasedSeriesRow,
} from "./stage-completion-types";
import { EMPTY_STAGE_COMPLETION_SNAPSHOT } from "./stage-completion-types";

function readObjectArray(value: unknown): Record<string, unknown>[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
}

function displayOrDash(value: string | undefined): string {
    return value?.trim() ? value : "—";
}

function pushDetail(rows: StageEventDetailRow[], parameter: string, value: string | undefined): void {
    const trimmed = value?.trim();
    if (!trimmed) {
        return;
    }
    rows.push({ parameter, value: trimmed });
}

function mapJournalDetails(detailsSource: Record<string, unknown>): StageEventDetailRow[] {
    const rows: StageEventDetailRow[] = [];

    pushDetail(rows, "Рулон", pickString(detailsSource.material_roll_label ?? detailsSource.materialRollLabel));
    pushDetail(rows, "Начало, м", pickString(detailsSource.length_start_m ?? detailsSource.lengthStartM));
    pushDetail(rows, "Конец, м", pickString(detailsSource.length_end_m ?? detailsSource.lengthEndM));
    pushDetail(rows, "Сторона", pickString(detailsSource.side_label ?? detailsSource.sideLabel));
    pushDetail(rows, "Ряд", pickString(detailsSource.line_selection_label ?? detailsSource.lineSelectionLabel));
    pushDetail(rows, "Карточка 1", pickString(detailsSource.card_start_label ?? detailsSource.cardStartLabel));
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

function mapInputRoll(row: Record<string, unknown>, index: number): StageIncomingRollRow {
    const materialRollId = pickString(row.material_roll_id ?? row.materialRollId);
    const barcode = pickRawString(row.barcode)?.trim() ?? "";
    const blocked = pickBoolean(row.blocked);

    return {
        id: materialRollId || barcode || `input-${index}`,
        material: displayOrDash(pickString(row.nomenclature_name ?? row.nomenclatureName)),
        nomenclature: displayOrDash(
            pickString(row.nomenclature_kind ?? row.nomenclatureKind ?? row.nomenclature_code ?? row.nomenclatureCode),
        ),
        series: displayOrDash(pickRawString(row.series) ?? barcode),
        quantity: pickNumber(row.quantity),
        unit: formatReleaseUomLabel(pickString(row.uom)),
        machine: displayOrDash(pickString(row.machine_code ?? row.machineCode)),
        status: displayOrDash(pickString(row.status_label ?? row.statusLabel)),
        fr: displayOrDash(pickString(row.block_reason_label ?? row.blockReasonLabel)),
        blocked,
    };
}

function mapOutputRelease(row: Record<string, unknown>, index: number): StageReleasedSeriesRow {
    const releaseId = pickString(row.material_production_release_id ?? row.materialProductionReleaseId);
    const materialRollId = pickString(row.material_roll_id ?? row.materialRollId);
    const barcode = pickRawString(row.barcode)?.trim() ?? "";
    const blocked = pickBoolean(row.blocked);

    return {
        id: releaseId || materialRollId || barcode || `release-${index}`,
        article: displayOrDash(pickString(row.nomenclature_code ?? row.nomenclatureCode)),
        nomenclature: displayOrDash(pickString(row.nomenclature_name ?? row.nomenclatureName)),
        rewind: pickBoolean(row.requires_rewind ?? row.requiresRewind),
        series: displayOrDash(
            pickRawString(row.barcode) ?? pickString(row.external_series_key ?? row.externalSeriesKey),
        ),
        netWeight: pickNumber(row.net_weight_kg ?? row.netWeightKg),
        grossWeight: pickNumber(row.gross_weight_kg ?? row.grossWeightKg),
        unit: formatReleaseUomLabel(pickString(row.uom_primary ?? row.uomPrimary)),
        quantity: pickNumber(row.quantity_primary ?? row.quantityPrimary),
        fr: displayOrDash(pickString(row.block_reason_label ?? row.blockReasonLabel)),
        blocked,
    };
}

function mapProcessJournalRow(row: Record<string, unknown>, index: number): StageEventJournalRow | null {
    const id =
        pickString(row.production_event_id ?? row.productionEventId) ??
        pickString(row.event_code_label ?? row.eventCodeLabel) ??
        `journal-${index}`;

    const eventCode = pickString(row.event_code_label ?? row.eventCodeLabel);
    if (!eventCode) {
        return null;
    }

    const detailsRaw = row.details;
    let details: StageEventDetailRow[] | undefined;
    if (Array.isArray(detailsRaw) && detailsRaw.length > 0) {
        const first = detailsRaw[0];
        if (first && typeof first === "object") {
            const mapped = mapJournalDetails(first as Record<string, unknown>);
            details = mapped.length > 0 ? mapped : undefined;
        }
    } else if (detailsRaw && typeof detailsRaw === "object") {
        const mapped = mapJournalDetails(detailsRaw as Record<string, unknown>);
        details = mapped.length > 0 ? mapped : undefined;
    }

    return {
        id,
        eventCode,
        start: displayOrDash(pickString(row.time_start_label ?? row.timeStartLabel)),
        end: displayOrDash(pickString(row.time_end_label ?? row.timeEndLabel)),
        meterage: pickNumber(row.length_m ?? row.lengthM),
        details,
    };
}

function mapUnprocessedEvent(row: Record<string, unknown>, index: number): StagePendingEventRow {
    const signalId = pickString(row.signal_id ?? row.signalId);
    return {
        id: signalId || `pending-${index}`,
        signal: displayOrDash(pickString(row.signal_description)),
        start: displayOrDash(pickString(row.time_start ?? row.timeStart)),
        end: displayOrDash(pickString(row.time_end ?? row.timeEnd)),
    };
}

function mapBlockingIssue(row: Record<string, unknown>): StageBlockingIssue | null {
    const message = pickString(row.message);
    if (!message) {
        return null;
    }

    return {
        code: pickString(row.code) ?? "",
        message,
    };
}

export function mapStageCompletionInitPayload(
    payload: ApiSchemas["OrderExecutionStageCompletionInitResponse"] | undefined,
): StageCompletionSnapshot {
    const fallbackMessage = "Не удалось загрузить данные завершения этапа";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultItem = (wrapper?.result?.[0] ?? {}) as Record<string, unknown>;

    const incomingRolls = readObjectArray(resultItem.input_rolls ?? resultItem.inputRolls).map(mapInputRoll);
    const releasedSeries = readObjectArray(resultItem.output_releases ?? resultItem.outputReleases).map(
        mapOutputRelease,
    );
    const eventJournal = readObjectArray(resultItem.process_journal ?? resultItem.processJournal)
        .map(mapProcessJournalRow)
        .filter((row): row is StageEventJournalRow => row !== null);
    const pendingEvents = readObjectArray(resultItem.unprocessed_events ?? resultItem.unprocessedEvents).map(
        mapUnprocessedEvent,
    );
    const blockingIssues = readObjectArray(resultItem.blocking_issues ?? resultItem.blockingIssues)
        .map(mapBlockingIssue)
        .filter((row): row is StageBlockingIssue => row !== null);

    return {
        ...EMPTY_STAGE_COMPLETION_SNAPSHOT,
        workAreaId: pickString(resultItem.work_area_id ?? resultItem.workAreaId) ?? "",
        incomingRolls,
        releasedSeries,
        eventJournal,
        pendingEvents,
        totalEventMeterage: pickNumber(resultItem.meterage_total_m ?? resultItem.meterageTotalM),
        defectPercent: pickNumber(resultItem.scrap_percent ?? resultItem.scrapPercent),
        canComplete: pickBoolean(resultItem.can_complete ?? resultItem.canComplete),
        blockingIssues,
        hasSuspendedStageOnMachine: false,
        suspendedStageLabel: undefined,
    };
}
