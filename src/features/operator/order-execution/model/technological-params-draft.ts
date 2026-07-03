import type { TechnologicalParamsSections } from "./technological-params-mock";

export type TechnologicalParamSectionKey = "unwinding1" | "unwinding2" | "winding1";

export type TechnologicalParamsDraft = {
    speedCurrent: string;
    params: Record<TechnologicalParamSectionKey, Record<string, string>>;
};

export function buildTechnologicalParamsDraft(data: TechnologicalParamsSections): TechnologicalParamsDraft {
    const toCurrentMap = (rows: TechnologicalParamsSections["unwinding1"]) =>
        Object.fromEntries(rows.map((row) => [row.label, row.current]));

    return {
        speedCurrent: data.speed.current,
        params: {
            unwinding1: toCurrentMap(data.unwinding1),
            unwinding2: toCurrentMap(data.unwinding2),
            winding1: toCurrentMap(data.winding1),
        },
    };
}
