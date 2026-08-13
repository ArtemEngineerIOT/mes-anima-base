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

function mapSliceMetas(rows: unknown): LastProcessParamsSliceMeta[] {
    if (!Array.isArray(rows)) {
        return [];
    }

    return rows
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((row) => ({
            sliceNo: pickNumber(row.slice_no ?? row.sliceNo) || 0,
            sliceKind: pickString(row.slice_kind ?? row.sliceKind) ?? "",
            externalSeriesKey:
                pickString(row.external_series_key ?? row.externalSeriesKey) ??
                pickString(row.column_label ?? row.columnLabel) ??
                "—",
            updatedAt: pickString(row.updated_at ?? row.updatedAt) ?? "—",
        }))
        .filter((meta) => meta.sliceNo > 0)
        .sort((a, b) => a.sliceNo - b.sliceNo);
}

function resolveSliceMeta(
    sliceMetas: LastProcessParamsSliceMeta[],
    sliceNo: number,
): LastProcessParamsSliceMeta | undefined {
    return sliceMetas.find((meta) => meta.sliceNo === sliceNo);
}

function buildHistoryFromSliceValues(
    startValue: unknown,
    slice1Value: unknown,
    slice2Value: unknown,
    sliceMetas: LastProcessParamsSliceMeta[],
): TechnologicalParamHistoryEntry[] {
    const entries: TechnologicalParamHistoryEntry[] = [];

    const appendEntry = (value: unknown, sliceNo: number) => {
        const normalized = normalizeDisplayValue(value);
        if (normalized === "—") {
            return;
        }

        const meta = resolveSliceMeta(sliceMetas, sliceNo);
        entries.push({
            rollNumber: meta?.externalSeriesKey ?? "—",
            checkedAt: meta?.updatedAt ?? "—",
            value: normalized,
        });
    };

    appendEntry(startValue, 1);
    appendEntry(slice1Value, 2);
    appendEntry(slice2Value, 3);

    return entries;
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
    sliceMetas: LastProcessParamsSliceMeta[],
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
            const presserNo = normalizeDisplayValue(row.presser_no ?? row.presserNo);
            const standard = normalizeDisplayValue(row.setpoint);
            const deviationPm = formatDeviationPm(row.tolerance);
            const start = normalizeDisplayValue(row.start_value ?? row.startValue);

            historyByRowId[rowId] = buildHistoryFromSliceValues(
                row.start_value ?? row.startValue,
                row.slice1_value ?? row.slice1Value,
                row.slice2_value ?? row.slice2Value,
                sliceMetas,
            );

            return {
                ...template,
                color: color === "—" ? "" : color,
                presserNo: presserNo === "—" ? "" : presserNo,
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

function mapMachineParams(
    rows: unknown,
    sections: TechnologicalParamsSections,
    sliceMetas: LastProcessParamsSliceMeta[],
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

        const patch = {
            standard: normalizeDisplayValue(row.standard_value ?? row.standardValue),
            deviationPm: formatDeviationPm(row.tolerance),
            start: normalizeDisplayValue(row.start_value ?? row.startValue),
        };

        historyByRowId[rowId] = buildHistoryFromSliceValues(
            row.start_value ?? row.startValue,
            row.slice1_value ?? row.slice1Value,
            row.slice2_value ?? row.slice2Value,
            sliceMetas,
        );

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

    const sliceMetas = mapSliceMetas(resultRow.slices);
    const printingSections = mapPrintSlots(
        resultRow.print_slots ?? resultRow.printSlots,
        baseSections,
        sliceMetas,
        historyByRowId,
    );

    let sections: TechnologicalParamsSections = {
        ...baseSections,
        printingSections,
    };

    sections = mapMachineParams(
        resultRow.machine_params ?? resultRow.machineParams,
        sections,
        sliceMetas,
        historyByRowId,
    );

    return { sections, historyByRowId };
}
