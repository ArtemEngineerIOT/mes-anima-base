import type { ApiSchemas } from "@/shared/api/schema";

import type { MaterialOrderLine, RollPickRow } from "./material-order-workspace-mock";

/** Значение по умолчанию для `<input type="datetime-local">` — текущие дата и время. */
export function formatMaterialOrderDateTimeLocalNow(): string {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function formatMaterialOrderSubmitTimestamp(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
        return "";
    }

    const parsed = parseMaterialOrderDateTime(trimmed);
    if (!parsed) {
        return trimmed;
    }

    const pad = (part: number) => String(part).padStart(2, "0");
    return `${pad(parsed.getDate())}.${pad(parsed.getMonth() + 1)}.${parsed.getFullYear()} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
}

function parseMaterialOrderDateTime(value: string): Date | null {
    const isoLocalMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (isoLocalMatch) {
        const [, year, month, day, hours, minutes, seconds] = isoLocalMatch;
        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hours),
            Number(minutes),
            seconds ? Number(seconds) : 0,
        );
    }

    const ruMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
    if (ruMatch) {
        const [, day, month, year, hours, minutes, seconds] = ruMatch;
        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hours),
            Number(minutes),
            Number(seconds),
        );
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function resolveComposeLineKey(line: ApiSchemas["MaterialOrderComposeLineResultItem"]): string | undefined {
    const row = line as Record<string, unknown>;
    const lineNo = row.line_no ?? row.lineNo;
    if (typeof lineNo === "number" && Number.isFinite(lineNo)) {
        return String(lineNo);
    }
    if (typeof lineNo === "string" && lineNo.trim()) {
        return lineNo.trim();
    }

    const lineId = row.line_id ?? row.lineId;
    return typeof lineId === "string" && lineId.trim() ? lineId.trim() : undefined;
}

function pickStringField(row: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = row[key];
        if (typeof value === "string") {
            return value;
        }
    }
    return "";
}

function pickStringArrayField(row: Record<string, unknown>, ...keys: string[]): string[] {
    for (const key of keys) {
        const value = row[key];
        if (Array.isArray(value)) {
            return value.filter((item): item is string => typeof item === "string");
        }
    }
    return [];
}

function resolveLineNomenclatureCode(line: ApiSchemas["MaterialOrderComposeLineResultItem"]): string {
    const row = line as Record<string, unknown>;
    return pickStringField(row, "nomenclature_code", "nomenclatureCode");
}

function resolveSelectedLotRefsForLine(
    nomenclatureCode: string,
    rollPicks: RollPickRow[],
    selectedRollIds: Set<string>,
): string[] {
    if (!nomenclatureCode) {
        return [];
    }

    return rollPicks
        .filter(
            (pick) =>
                !pick.blocked &&
                selectedRollIds.has(pick.id) &&
                pick.nomenclature.trim() === nomenclatureCode.trim(),
        )
        .map((pick) => pick.id);
}

function resolveSeriesRefForLine(
    line: ApiSchemas["MaterialOrderComposeLineResultItem"],
    rollPicks: RollPickRow[],
    selectedRollIds: Set<string>,
): string {
    const row = line as Record<string, unknown>;
    const fromCompose = pickStringField(row, "series_ref", "seriesRef");
    if (fromCompose) {
        return fromCompose;
    }

    const nomenclatureCode = resolveLineNomenclatureCode(line);
    const selectedPick = rollPicks.find(
        (pick) =>
            !pick.blocked &&
            selectedRollIds.has(pick.id) &&
            pick.nomenclature.trim() === nomenclatureCode.trim(),
    );

    return selectedPick?.series ?? "";
}

export function buildMaterialOrderSubmitLines(
    composeLines: ApiSchemas["MaterialOrderComposeLineResultItem"][],
    materialLines: MaterialOrderLine[],
    rollPicks: RollPickRow[],
    selectedRollIds: Set<string>,
): ApiSchemas["MaterialOrderComposeLineResultItem"][] {
    const requestedQtyByLineKey = new Map(materialLines.map((line) => [line.id, line.requestedQty]));

    return composeLines.map((line) => {
        const row = line as Record<string, unknown>;
        const lineKey = resolveComposeLineKey(line);
        const editedQty = lineKey ? requestedQtyByLineKey.get(lineKey) : undefined;
        const nomenclatureCode = resolveLineNomenclatureCode(line);
        const selectedLotRefs = resolveSelectedLotRefsForLine(nomenclatureCode, rollPicks, selectedRollIds);
        const lotRefsFromCompose = pickStringArrayField(row, "lot_refs", "lotRefs");
        const seriesRef = resolveSeriesRefForLine(line, rollPicks, selectedRollIds);

        return {
            ...line,
            ...(editedQty !== undefined ? { requested_quantity: editedQty } : {}),
            series_ref: seriesRef,
            lot_refs: selectedLotRefs.length > 0 ? selectedLotRefs : lotRefsFromCompose,
        };
    });
}

export function buildMaterialOrderSubmitBody(input: {
    workAreaIds: string;
    composeLines: ApiSchemas["MaterialOrderComposeLineResultItem"][];
    materialLines: MaterialOrderLine[];
    rollPicks: RollPickRow[];
    selectedRollIds: Set<string>;
    byTime: string;
    warehouseComment: string;
    materialChangeEnabled: boolean;
}): ApiSchemas["MaterialOrderSubmitRequest"] {
    return [
        {
            workAreaIds: input.workAreaIds,
            lines: buildMaterialOrderSubmitLines(
                input.composeLines,
                input.materialLines,
                input.rollPicks,
                input.selectedRollIds,
            ),
            timestamp: formatMaterialOrderSubmitTimestamp(input.byTime),
            comment: input.warehouseComment.trim(),
            isMaterialChange: input.materialChangeEnabled,
        },
    ];
}
