import type { ApiSchemas } from "@/shared/api/schema";
import { assertReleaseRpcOk, pickNumber } from "../release/map-release-rpc-utils";
import { MONITORING_EMPTY_LINE_METERS, type MonitoringLineMeters } from "./types";

function readFirstObjectRow(value: unknown): Record<string, unknown> | undefined {
    if (Array.isArray(value) && value[0] && typeof value[0] === "object") {
        return value[0] as Record<string, unknown>;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
        const obj = value as Record<string, unknown>;

        if (Array.isArray(obj.records) && obj.records[0] && typeof obj.records[0] === "object") {
            return obj.records[0] as Record<string, unknown>;
        }

        if (Array.isArray(obj.table) && obj.table[0] && typeof obj.table[0] === "object") {
            return obj.table[0] as Record<string, unknown>;
        }
    }

    return undefined;
}

function readLineMetersBundle(resultItem: Record<string, unknown>): {
    inputRow?: Record<string, unknown>;
    outputRow?: Record<string, unknown>;
    flatRow?: Record<string, unknown>;
} {
    const raw = resultItem.line_meters ?? resultItem.lineMeters;
    const lineMetersRow = readFirstObjectRow(raw);

    if (!lineMetersRow) {
        return {};
    }

    const inputRow = readFirstObjectRow(lineMetersRow.input);
    const outputRow = readFirstObjectRow(lineMetersRow.output);

    if (inputRow || outputRow) {
        return { inputRow, outputRow };
    }

    if (
        "input_total" in lineMetersRow ||
        "inputTotal" in lineMetersRow ||
        "output_total" in lineMetersRow ||
        "outputTotal" in lineMetersRow
    ) {
        return { flatRow: lineMetersRow };
    }

    return {};
}

export function mapMonitoringSummaryPayload(
    payload: ApiSchemas["OrderExecutionMonitoringSummaryResponse"] | undefined,
): MonitoringLineMeters {
    const fallbackMessage = "Не удалось загрузить метраж входа и выхода";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    if (!resultItem) {
        return MONITORING_EMPTY_LINE_METERS;
    }

    const { inputRow, outputRow, flatRow } = readLineMetersBundle(resultItem);
    if (!inputRow && !outputRow && !flatRow) {
        return MONITORING_EMPTY_LINE_METERS;
    }

    const sourceInput = inputRow ?? flatRow;
    const sourceOutput = outputRow ?? flatRow;

    return {
        inLine: {
            totalM: pickNumber(sourceInput?.input_total ?? sourceInput?.inputTotal),
            rollInM: pickNumber(sourceInput?.input_roll ?? sourceInput?.inputRoll),
        },
        outLine: {
            totalM: pickNumber(sourceOutput?.output_total ?? sourceOutput?.outputTotal),
            rollOutM: pickNumber(sourceOutput?.output_roll ?? sourceOutput?.outputRoll),
        },
    };
}
