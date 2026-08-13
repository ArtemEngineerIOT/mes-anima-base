import type { TechnologicalParamHistoryEntry } from "../../technological-params-history";
import type { TechnologicalParamsSections } from "../../technological-params-mock";
import type { TechnologicalParamTagKey } from "../../resolve-technological-param-stomp-value";

export type LastProcessParamsSliceMeta = {
    sliceNo: number;
    sliceKind: string;
    externalSeriesKey: string;
    updatedAt: string;
};

export type LastProcessParamsSlicesSnapshot = {
    sections: TechnologicalParamsSections;
    historyByRowId: Record<string, TechnologicalParamHistoryEntry[]>;
};

/** Соответствие `param_code` machine_params → id строки UI. */
export const LAST_PROCESS_PARAMS_MACHINE_PARAM_ROW_BY_CODE: Record<string, string> = {
    print_speed: "print-speed",
    unwinding1_reelstrain: "unwinding-roll-tension",
    unwinding1_group: "unwinding-drawing-group",
    unwinding1_coronator: "unwinding-coronator",
    winding_reelstrain: "winding-roll-tension",
    winding_group: "winding-drawing-group",
    winding_difference: "winding-tension-drop",
    winding_group_pressure: "winding-group-pressure",
    winding_reelshaft_pressure: "winding-roll-shaft-press",
};

export type ProcessParamsSliceParamBinding = {
    rowId: string;
    /** Порядок частей составного значения (несколько hood-тегов). */
    partIndex: number;
};

function asTagKeys(value: TechnologicalParamTagKey | undefined): string[] {
    if (!value) {
        return [];
    }
    if (typeof value === "string") {
        return [value];
    }
    return [...value];
}

/** Уставки (`*_SET_*`) в срезы колонок не берём — только ACT / прочие фактические коды. */
export function isSetProcessParamCode(paramCode: string): boolean {
    return /_SET_/i.test(paramCode.trim());
}

/** Строит lookup `param_code` → строка UI только по ACT-тегам (`stompFieldKey`). */
export function buildProcessParamsParamCodeBindings(
    data: TechnologicalParamsSections,
): Map<string, ProcessParamsSliceParamBinding> {
    const bindings = new Map<string, ProcessParamsSliceParamBinding>();

    const register = (rowId: string, codes: string[]) => {
        codes.forEach((code, partIndex) => {
            const normalized = code.trim();
            if (!normalized || isSetProcessParamCode(normalized) || bindings.has(normalized)) {
                return;
            }
            bindings.set(normalized, { rowId, partIndex });
        });
    };

    for (const row of data.printingSections) {
        register(row.id, asTagKeys(row.stompFieldKey));
    }
    for (const row of data.unwinding) {
        register(row.id, asTagKeys(row.stompFieldKey));
    }
    for (const row of data.winding) {
        register(row.id, asTagKeys(row.stompFieldKey));
    }
    register(data.speed.id, asTagKeys(data.speed.stompFieldKey));

    return bindings;
}

export type ProcessParamsSliceRow = {
    sliceNo: number;
    externalSeriesKey: string;
    paramCode: string;
    value: string;
    /** Время последнего изменения — `updated_at` с бэка. */
    updatedAt: string;
};
