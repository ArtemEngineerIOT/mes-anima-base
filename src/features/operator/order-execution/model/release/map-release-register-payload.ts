import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk, pickBoolean, pickString } from "./map-release-rpc-utils";

export type ReleaseRegisterResult = {
    message: string;
    batchReleasesRefreshHint: boolean;
    externalSeriesKey: string;
    materialRollId: string;
};

export function mapReleaseRegisterPayload(
    payload: ApiSchemas["OrderExecutionRegisterReleaseResponse"] | undefined,
): ReleaseRegisterResult {
    const fallbackMessage = "Не удалось зарегистрировать выпуск";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const result = (wrapper?.result?.[0] ?? undefined) as Record<string, unknown> | undefined;
    const integrationStatus =
        pickString(result?.integration_1s_status ?? result?.integration1sStatus) ?? "ACCEPTED";
    const releaseStatus = pickString(result?.release_status ?? result?.releaseStatus) ?? "LOCKED";

    return {
        message: `Выпуск зарегистрирован (${releaseStatus}, 1С: ${integrationStatus})`,
        batchReleasesRefreshHint: pickBoolean(
            result?.batch_releases_refresh_hint ?? result?.batchReleasesRefreshHint,
        ),
        externalSeriesKey: pickString(result?.external_series_key ?? result?.externalSeriesKey) ?? "",
        materialRollId: pickString(result?.material_roll_id ?? result?.materialRollId) ?? "",
    };
}
