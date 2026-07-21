import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk } from "../release/map-release-rpc-utils";
import { STAGE_PROGRESS_EMPTY, type StageProgress, type StageProgressInfoItem } from "./types";

function pickNullableNumber(value: unknown): number | null {
    if (value == null || value === "") {
        return null;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return null;
}

function formatMeterageM(value: number | null, loading: boolean): string {
    if (loading) {
        return "…";
    }
    if (value == null) {
        return "—";
    }
    return `${value} м`;
}

function formatProgressPercent(value: number | null, loading: boolean): string {
    if (loading) {
        return "…";
    }
    if (value == null) {
        return "—";
    }
    return `${value}%`;
}

export function mapStageProgressPayload(
    payload: ApiSchemas["OrderExecutionStageProgressResponse"] | undefined,
): StageProgress {
    const fallbackMessage = "Не удалось загрузить прогресс этапа";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    if (!resultItem) {
        return STAGE_PROGRESS_EMPTY;
    }

    return {
        requiredMeterageM: pickNullableNumber(
            resultItem.required_meterage_m ?? resultItem.requiredMeterageM,
        ),
        releasedGoodMeterageM: pickNullableNumber(
            resultItem.released_good_meterage_m ?? resultItem.releasedGoodMeterageM,
        ),
        remainingMeterageM: pickNullableNumber(
            resultItem.remaining_meterage_m ?? resultItem.remainingMeterageM,
        ),
        progressPercent: pickNullableNumber(resultItem.progress_percent ?? resultItem.progressPercent),
    };
}

export function toStageProgressInfoItems(
    progress: StageProgress,
    options?: { loading?: boolean },
): StageProgressInfoItem[] {
    const loading = options?.loading ?? false;

    return [
        { key: "План", value: formatMeterageM(progress.requiredMeterageM, loading) },
        { key: "Выпуск", value: formatMeterageM(progress.releasedGoodMeterageM, loading) },
        { key: "Остаток", value: formatMeterageM(progress.remainingMeterageM, loading) },
        { key: "Прогресс", value: formatProgressPercent(progress.progressPercent, loading) },
    ];
}
