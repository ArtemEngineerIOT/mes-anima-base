import type { ApiSchemas } from "@/shared/api/schema";
import {
    assertReleaseRpcOk,
    pickBoolean,
    pickNumber,
    pickRawString,
    pickString,
} from "../release/map-release-rpc-utils";
import {
    MONITORING_EMPTY_ROLL_TABLES,
    type MonitoringInputRollRow,
    type MonitoringOutputRollRow,
    type MonitoringRollTables,
} from "./types";

function readTableRows(value: unknown): unknown[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
        const obj = value as Record<string, unknown>;

        if (Array.isArray(obj.records)) {
            return obj.records;
        }

        if (Array.isArray(obj.table)) {
            return obj.table;
        }
    }

    return [];
}

function readRollTablesFromResult(resultItem: Record<string, unknown>): {
    inputRolls: unknown[];
    outputRolls: unknown[];
} {
    const inputRolls = readTableRows(resultItem.input_rolls ?? resultItem.inputRolls);
    const outputRolls = readTableRows(resultItem.output_rolls ?? resultItem.outputRolls);

    if (inputRolls.length > 0 || outputRolls.length > 0) {
        return { inputRolls, outputRolls };
    }

    const nestedInput = readTableRows(resultItem.input);
    const nestedOutput = readTableRows(resultItem.output);

    return {
        inputRolls: nestedInput,
        outputRolls: nestedOutput,
    };
}

function mapInputRollRow(row: Record<string, unknown>): MonitoringInputRollRow | null {
    const roll = pickRawString(row.barcode) ?? pickRawString(row.external_id ?? row.externalId);
    if (!roll) {
        return null;
    }

    return {
        roll,
        lengthM: pickNumber(row.length_m ?? row.lengthM),
    };
}

function mapOutputRollRow(row: Record<string, unknown>): MonitoringOutputRollRow | null {
    const roll = pickRawString(row.barcode) ?? pickRawString(row.external_id ?? row.externalId);
    if (!roll) {
        return null;
    }

    const blocked = pickBoolean(row.blocked);
    const reasonLabel = pickString(row.block_reason_label ?? row.blockReasonLabel);

    return {
        roll,
        lengthM: pickNumber(row.length_m ?? row.lengthM),
        composition: pickString(row.composition) ?? "—",
        reason: reasonLabel ?? (blocked ? "—" : "-"),
        blocked,
    };
}

export function mapMonitoringRollTablesPayload(
    payload: ApiSchemas["OrderExecutionMonitoringRollTablesResponse"] | undefined,
): MonitoringRollTables {
    const fallbackMessage = "Не удалось загрузить таблицы рулонов";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    if (!resultItem) {
        return MONITORING_EMPTY_ROLL_TABLES;
    }

    const { inputRolls, outputRolls } = readRollTablesFromResult(resultItem);

    return {
        inputRolls: inputRolls
            .map((row) => mapInputRollRow(row as Record<string, unknown>))
            .filter((row): row is MonitoringInputRollRow => row !== null),
        outputRolls: outputRolls
            .map((row) => mapOutputRollRow(row as Record<string, unknown>))
            .filter((row): row is MonitoringOutputRollRow => row !== null),
    };
}
