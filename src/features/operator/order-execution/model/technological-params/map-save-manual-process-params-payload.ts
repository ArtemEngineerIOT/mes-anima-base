import type { ApiSchemas } from "@/shared/api/schema";

import { assertReleaseRpcOk } from "../release/map-release-rpc-utils";

export function mapSaveManualProcessParamsPayload(
    payload: ApiSchemas["OrderExecutionSaveManualProcessParamsResponse"] | undefined,
): void {
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, "Не удалось сохранить ручной срез технологических параметров");
}
