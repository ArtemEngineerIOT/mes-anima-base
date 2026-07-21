import type { TechnologicalParamHistoryEntry } from "../../technological-params-history";
import type { TechnologicalParamsSections } from "../../technological-params-mock";
import type { TechnologicalParamTagKey } from "../../resolve-technological-param-stomp-value";

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

export type LastProcessParamsSlicesSnapshot = {
    /** История по id строки таблицы (Старт / Срез 1 / Срез 2). */
    historyByRowId: Record<string, TechnologicalParamHistoryEntry[]>;
};
