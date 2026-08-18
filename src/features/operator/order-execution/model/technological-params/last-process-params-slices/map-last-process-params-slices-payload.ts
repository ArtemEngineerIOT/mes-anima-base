/**
 * Порядок разбора getLastProcessParamsSlices:
 * 1. Каркас строк UI (подписи, STOMP-ключи).
 * 2. Дефолты технолога из корневых `machine_params` / `print_slots`
 *    (standard_value, tolerance, setpoint, color, slot_role, is_empty).
 * 3. Срезы из `slices[]`: `slice_kind` → колонка, `captured_at` → время в шапке,
 *    вложенные `machine_params[].value` / `print_slots[].value` → ячейки.
 */
import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickNumber, pickString } from "../../release/map-release-rpc-utils";
import type { TechnologicalParamHistoryEntry } from "../../technological-params-history";
import {
    buildInitialTechnologicalParamHistory,
    getTechnologicalParamsMock,
    type TechnologicalParamsSections,
    type TechnologicalPrintingSectionRow,
    type TechnologicalProcessParamRow,
    type TechnologicalSpeedRow,
} from "../../technological-params-mock";
import type { MachineId } from "../../types";
import {
    LAST_PROCESS_PARAMS_MACHINE_PARAM_ROW_BY_CODE,
    type LastProcessParamsSliceMeta,
    type LastProcessParamsSlicesSnapshot,
} from "./types";

const UNDEFINED_MARKERS = new Set(["не определено", "—", "-"]);

type MappedSlice = {
    meta: LastProcessParamsSliceMeta;
    isStart: boolean;
    machineParamByCode: Map<string, string>;
    printSlotByNo: Map<number, string>;
};

function isUndefinedValue(value: string | undefined): boolean {
    if (!value) {
        return true;
    }

    return UNDEFINED_MARKERS.has(value.trim().toLowerCase());
}

function normalizeDisplayValue(value: unknown): string {
    const normalized = pickString(value);
    if (!normalized || isUndefinedValue(normalized)) {
        return "—";
    }

    return normalized;
}

function formatDeviationPm(tolerance: unknown): string {
    const normalized = normalizeDisplayValue(tolerance);
    if (normalized === "—") {
        return "—";
    }

    return `± ${normalized}`;
}

function isPrintSlotEmpty(row: Record<string, unknown>): boolean {
    const raw = pickString(row.is_empty ?? row.isEmpty);
    return raw?.toLowerCase() === "true";
}

function isStartSliceKind(kind: string): boolean {
    return kind.trim().toUpperCase() === "START";
}

function readResultRow(
    payload: ApiSchemas["OrderExecutionLastProcessParamsSlicesResponse"] | undefined,
): Record<string, unknown> | null {
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, "Не удалось загрузить технологические параметры");

    const result = wrapper?.result;
    if (!Array.isArray(result) || result.length === 0) {
        return null;
    }

    const row = result[0];
    if (typeof row !== "object" || row === null) {
        return null;
    }

    return row as Record<string, unknown>;
}

function mapNestedMachineParamValues(rows: unknown): Map<string, string> {
    const values = new Map<string, string>();
    if (!Array.isArray(rows)) {
        return values;
    }

    for (const item of rows) {
        if (typeof item !== "object" || item === null) {
            continue;
        }

        const row = item as Record<string, unknown>;
        const paramCode = pickString(row.param_code ?? row.paramCode);
        if (!paramCode) {
            continue;
        }

        values.set(paramCode, normalizeDisplayValue(row.value));
    }

    return values;
}

function mapNestedPrintSlotValues(rows: unknown): Map<number, string> {
    const values = new Map<number, string>();
    if (!Array.isArray(rows)) {
        return values;
    }

    for (const item of rows) {
        if (typeof item !== "object" || item === null) {
            continue;
        }

        const row = item as Record<string, unknown>;
        const slotNo = pickNumber(row.slot_no ?? row.slotNo);
        if (!slotNo) {
            continue;
        }

        values.set(slotNo, normalizeDisplayValue(row.value));
    }

    return values;
}

function mapSlices(rows: unknown): MappedSlice[] {
    if (!Array.isArray(rows)) {
        return [];
    }

    const slices = rows
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((row) => {
            const sliceNo = pickNumber(row.slice_no ?? row.sliceNo) || 0;
            const sliceKind = pickString(row.slice_kind ?? row.sliceKind) ?? "";
            const capturedAt =
                pickString(row.captured_at ?? row.capturedAt) ??
                pickString(row.updated_at ?? row.updatedAt) ??
                "—";

            return {
                meta: {
                    sliceNo,
                    sliceKind,
                    externalSeriesKey:
                        pickString(row.external_series_key ?? row.externalSeriesKey) ??
                        pickString(row.column_label ?? row.columnLabel) ??
                        "—",
                    updatedAt: capturedAt,
                },
                isStart: isStartSliceKind(sliceKind),
                machineParamByCode: mapNestedMachineParamValues(row.machine_params ?? row.machineParams),
                printSlotByNo: mapNestedPrintSlotValues(row.print_slots ?? row.printSlots),
            };
        })
        .filter((slice) => slice.meta.sliceNo > 0)
        .sort((a, b) => a.meta.sliceNo - b.meta.sliceNo);

    return slices;
}

function historyEntryFromSlice(
    slice: MappedSlice,
    value: string,
): TechnologicalParamHistoryEntry {
    return {
        rollNumber: slice.meta.externalSeriesKey,
        checkedAt: slice.meta.updatedAt,
        value,
    };
}

function buildRowHistoryFromSlices(
    slices: MappedSlice[],
    getValue: (slice: MappedSlice) => string | undefined,
): { start: string; history: TechnologicalParamHistoryEntry[] } {
    const startSlice = slices.find((slice) => slice.isStart);
    const start = startSlice ? (getValue(startSlice) ?? "—") : "—";
    const history: TechnologicalParamHistoryEntry[] = [
        startSlice
            ? historyEntryFromSlice(startSlice, start)
            : { rollNumber: "—", checkedAt: "—", value: "—" },
    ];

    for (const slice of slices) {
        if (slice.isStart) {
            continue;
        }

        history.push(historyEntryFromSlice(slice, getValue(slice) ?? "—"));
    }

    return { start, history };
}

function resolvePrintingSectionTemplate(
    baseSections: TechnologicalParamsSections,
    sectionNumber: number,
): TechnologicalPrintingSectionRow {
    const existing = baseSections.printingSections.find((row) => row.sectionNumber === sectionNumber);
    if (existing) {
        return { ...existing };
    }

    const hoodCount = sectionNumber === 10 ? 4 : sectionNumber === 9 ? 2 : sectionNumber <= 3 ? 2 : 1;
    const hoods = Array.from({ length: hoodCount }, (_, index) => index + 1);

    return {
        id: `printing-${sectionNumber}`,
        sectionNumber,
        color: "",
        presserNo: "",
        standard: "—",
        deviationPm: "± 5",
        start: "—",
        history: [],
        stompStandardFieldKey: hoods.map((hood) => `UNIT_${sectionNumber}_HOOD_${hood}_SET_TEMP_`),
        stompFieldKey: hoods.map((hood) => `UNIT_${sectionNumber}_HOOD_${hood}_ACT_TEMP_`),
        fallbackCurrent: "—",
    };
}

function mapPrintSlots(
    rows: unknown,
    baseSections: TechnologicalParamsSections,
    slices: MappedSlice[],
    historyByRowId: Record<string, TechnologicalParamHistoryEntry[]>,
): TechnologicalPrintingSectionRow[] {
    if (!Array.isArray(rows)) {
        return baseSections.printingSections.map((row) => ({ ...row }));
    }

    return rows
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((row) => {
            const sectionNumber = pickNumber(row.slot_no ?? row.slotNo);
            if (!sectionNumber) {
                return null;
            }

            const template = resolvePrintingSectionTemplate(baseSections, sectionNumber);
            const rowId = template.id;

            if (isPrintSlotEmpty(row)) {
                historyByRowId[rowId] = [];
                return {
                    ...template,
                    isEmpty: true,
                    color: "",
                    presserNo: "",
                    standard: "",
                    deviationPm: "",
                    start: "",
                    stompFieldKey: undefined,
                    stompStandardFieldKey: undefined,
                    fallbackCurrent: "",
                };
            }

            const color = normalizeDisplayValue(row.color);
            const presserNo = pickString(row.presser_no ?? row.presserNo) ?? "";
            const standard = normalizeDisplayValue(row.setpoint);
            const deviationPm = formatDeviationPm(row.tolerance);
            const { start, history } = buildRowHistoryFromSlices(slices, (slice) =>
                slice.printSlotByNo.get(sectionNumber),
            );

            historyByRowId[rowId] = history;

            return {
                ...template,
                color: color === "—" ? "" : color,
                presserNo,
                standard,
                deviationPm,
                start,
            };
        })
        .filter((row): row is TechnologicalPrintingSectionRow => row !== null)
        .sort((a, b) => a.sectionNumber - b.sectionNumber);
}

function applyMachineParamRowPatch<T extends TechnologicalProcessParamRow | TechnologicalSpeedRow>(
    row: T,
    patch: Partial<T>,
): T {
    return { ...row, ...patch };
}

function buildHistoryByRowIdFromSlices(
    slices: MappedSlice[],
    sections: TechnologicalParamsSections,
): Record<string, TechnologicalParamHistoryEntry[]> {
    const historyByRowId: Record<string, TechnologicalParamHistoryEntry[]> = {};

    for (const row of sections.printingSections) {
        if (row.isEmpty) {
            historyByRowId[row.id] = [];
            continue;
        }

        const { history } = buildRowHistoryFromSlices(slices, (slice) =>
            slice.printSlotByNo.get(row.sectionNumber),
        );
        historyByRowId[row.id] = history;
    }

    const paramCodeByRowId = new Map(
        Object.entries(LAST_PROCESS_PARAMS_MACHINE_PARAM_ROW_BY_CODE).map(([paramCode, rowId]) => [
            rowId,
            paramCode,
        ]),
    );

    const applyMachineRow = (rowId: string) => {
        const paramCode = paramCodeByRowId.get(rowId);
        if (!paramCode) {
            return;
        }

        const { history } = buildRowHistoryFromSlices(slices, (slice) =>
            slice.machineParamByCode.get(paramCode),
        );
        historyByRowId[rowId] = history;
    };

    for (const row of sections.unwinding) {
        applyMachineRow(row.id);
    }
    for (const row of sections.winding) {
        applyMachineRow(row.id);
    }
    applyMachineRow(sections.speed.id);

    return historyByRowId;
}

function mapMachineParams(
    rows: unknown,
    sections: TechnologicalParamsSections,
    slices: MappedSlice[],
    historyByRowId: Record<string, TechnologicalParamHistoryEntry[]>,
): TechnologicalParamsSections {
    if (!Array.isArray(rows)) {
        return sections;
    }

    const nextSections: TechnologicalParamsSections = {
        ...sections,
        unwinding: sections.unwinding.map((row) => ({ ...row })),
        winding: sections.winding.map((row) => ({ ...row })),
        speed: { ...sections.speed },
    };

    for (const item of rows) {
        if (typeof item !== "object" || item === null) {
            continue;
        }

        const row = item as Record<string, unknown>;
        const paramCode = pickString(row.param_code ?? row.paramCode);
        if (!paramCode) {
            continue;
        }

        const rowId = LAST_PROCESS_PARAMS_MACHINE_PARAM_ROW_BY_CODE[paramCode];
        if (!rowId) {
            continue;
        }

        const { start, history } = buildRowHistoryFromSlices(slices, (slice) =>
            slice.machineParamByCode.get(paramCode),
        );

        const patch = {
            standard: normalizeDisplayValue(row.standard_value ?? row.standardValue),
            deviationPm: formatDeviationPm(row.tolerance),
            start,
        };

        historyByRowId[rowId] = history;

        if (rowId === nextSections.speed.id) {
            nextSections.speed = applyMachineParamRowPatch(nextSections.speed, patch);
            continue;
        }

        const unwindingIndex = nextSections.unwinding.findIndex((entry) => entry.id === rowId);
        if (unwindingIndex >= 0) {
            nextSections.unwinding[unwindingIndex] = applyMachineParamRowPatch(
                nextSections.unwinding[unwindingIndex],
                patch,
            );
            continue;
        }

        const windingIndex = nextSections.winding.findIndex((entry) => entry.id === rowId);
        if (windingIndex >= 0) {
            nextSections.winding[windingIndex] = applyMachineParamRowPatch(
                nextSections.winding[windingIndex],
                patch,
            );
        }
    }

    return nextSections;
}

export function mapLastProcessParamsSlicesPayload(
    payload: ApiSchemas["OrderExecutionLastProcessParamsSlicesResponse"] | undefined,
    machineId: MachineId,
): LastProcessParamsSlicesSnapshot {
    const baseSections = getTechnologicalParamsMock(machineId);
    const historyByRowId = buildInitialTechnologicalParamHistory(baseSections);

    const resultRow = readResultRow(payload);
    if (!resultRow) {
        return { sections: baseSections, historyByRowId };
    }

    const slices = mapSlices(resultRow.slices);
    const printingSections = mapPrintSlots(
        resultRow.print_slots ?? resultRow.printSlots,
        baseSections,
        slices,
        historyByRowId,
    );
    const sections = mapMachineParams(
        resultRow.machine_params ?? resultRow.machineParams,
        {
            ...baseSections,
            printingSections,
        },
        slices,
        historyByRowId,
    );

    return { sections, historyByRowId };
}

/** После STOMP `processParamsSliceCreated`: из ответа берём только `slices`. */
export function mapLastProcessParamsSlicesHistory(
    payload: ApiSchemas["OrderExecutionLastProcessParamsSlicesResponse"] | undefined,
    sections: TechnologicalParamsSections,
): Record<string, TechnologicalParamHistoryEntry[]> {
    const resultRow = readResultRow(payload);
    if (!resultRow) {
        return buildHistoryByRowIdFromSlices([], sections);
    }

    return buildHistoryByRowIdFromSlices(mapSlices(resultRow.slices), sections);
}
