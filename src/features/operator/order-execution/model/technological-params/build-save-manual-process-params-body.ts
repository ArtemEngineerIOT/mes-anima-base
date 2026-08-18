import { splitTechnologicalParamManualParts } from "../technological-params-manual-value";
import type { TechnologicalParamsSections } from "../technological-params-mock";
import { buildProcessParamsParamCodeBindings } from "./last-process-params-slices/types";

type BuildManualProcessParamsPayloadJsonOptions = {
    workAreaId: string;
    externalSeriesKey: string;
    sections: TechnologicalParamsSections;
    manualValues: Record<string, string>;
    presserNumbers?: Record<string, string>;
};

function buildParamCodesByRowId(sections: TechnologicalParamsSections): Map<string, string[]> {
    const bindings = buildProcessParamsParamCodeBindings(sections);
    const codesByRowId = new Map<string, string[]>();

    for (const [paramCode, binding] of bindings) {
        const codes = codesByRowId.get(binding.rowId) ?? [];
        codes[binding.partIndex] = paramCode;
        codesByRowId.set(binding.rowId, codes);
    }

    return codesByRowId;
}

export function buildManualProcessParamsPayloadJson({
    workAreaId,
    externalSeriesKey,
    sections,
    manualValues,
    presserNumbers = {},
}: BuildManualProcessParamsPayloadJsonOptions): string {
    const codesByRowId = buildParamCodesByRowId(sections);
    const parameters: Array<{ param_code: string; value: string; origin: "OPERATOR" }> = [];

    for (const [rowId, rawValue] of Object.entries(manualValues)) {
        const value = rawValue.trim();
        if (!value) {
            continue;
        }

        const codes = (codesByRowId.get(rowId) ?? []).filter(Boolean);
        if (codes.length === 0) {
            parameters.push({ param_code: rowId, value, origin: "OPERATOR" });
            continue;
        }

        const parts = splitTechnologicalParamManualParts(value, codes.length);
        codes.forEach((paramCode, index) => {
            const part = parts[index]?.trim() ?? "";
            if (!part) {
                return;
            }
            parameters.push({ param_code: paramCode, value: part, origin: "OPERATOR" });
        });
    }

    for (const row of sections.printingSections) {
        const presserNo = presserNumbers[row.id]?.trim() ?? "";
        if (!presserNo) {
            continue;
        }
        parameters.push({
            param_code: `presser_ps${row.sectionNumber}`,
            value: presserNo,
            origin: "OPERATOR",
        });
    }

    return JSON.stringify({
        tables: {
            parameters,
        },
        fields: {
            work_area_id: workAreaId,
            external_series_key: externalSeriesKey,
        },
    });
}

export function countManualProcessParams(payloadJson: string): number {
    try {
        const parsed = JSON.parse(payloadJson) as {
            tables?: { parameters?: unknown[] };
        };
        return Array.isArray(parsed.tables?.parameters) ? parsed.tables.parameters.length : 0;
    } catch {
        return 0;
    }
}
