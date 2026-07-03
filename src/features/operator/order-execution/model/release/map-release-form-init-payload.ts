import type { ApiSchemas } from "@/shared/api/schema";

import {
    assertReleaseRpcOk,
    mapReleaseWarehouseOption,
    pickNullableNumber,
    pickString,
} from "./map-release-rpc-utils";
import type { ReleaseInitSnapshot } from "./types";
import { RELEASE_EMPTY_INIT } from "./types";

export function mapReleaseFormInitPayload(
    payload: ApiSchemas["OrderExecutionReleaseFormInitResponse"] | undefined,
): ReleaseInitSnapshot {
    const fallbackMessage = "Не удалось загрузить данные по серии";
    const wrapper = payload?.[0];
    assertReleaseRpcOk(wrapper, fallbackMessage);

    const resultItem = wrapper?.result?.[0] as Record<string, unknown> | undefined;
    if (!resultItem) {
        return RELEASE_EMPTY_INIT;
    }

    const warehouseRows = Array.isArray(resultItem.destination_warehouses)
        ? resultItem.destination_warehouses
        : Array.isArray(resultItem.destinationWarehouses)
          ? resultItem.destinationWarehouses
          : [];

    const warehouseOptions = warehouseRows
        .map((row) => mapReleaseWarehouseOption(row as Record<string, unknown>))
        .filter((row): row is NonNullable<typeof row> => row !== null);

    const defaultWarehouseCode =
        pickString(resultItem.default_destination_warehouse_code ?? resultItem.defaultDestinationWarehouseCode) ??
        warehouseOptions[0]?.warehouseCode ??
        "";

    const defaultExists = warehouseOptions.some((option) => option.warehouseCode === defaultWarehouseCode);

    return {
        workAreaId: pickString(resultItem.work_area_id ?? resultItem.workAreaId) ?? "",
        predictedExternalSeriesKey:
            pickString(resultItem.predicted_external_series_key ?? resultItem.predictedExternalSeriesKey) ?? "",
        seriesBase: pickString(resultItem.series_base ?? resultItem.seriesBase) ?? "",
        nextRollIndex: pickNullableNumber(resultItem.next_roll_index ?? resultItem.nextRollIndex),
        releaseCountOnWorkArea: pickNullableNumber(
            resultItem.release_count_on_work_area ?? resultItem.releaseCountOnWorkArea,
        ),
        warehouseOptions,
        defaultWarehouseCode: defaultExists ? defaultWarehouseCode : (warehouseOptions[0]?.warehouseCode ?? ""),
    };
}
