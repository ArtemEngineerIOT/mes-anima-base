import type { ApiSchemas } from "@/shared/api/schema";

export function buildMockListMaterialSignalResponse(workAreaId: string) {
    const normalized = workAreaId.trim();

    if (!normalized) {
        return [
            {
                error_code: "INVALID_INPUT",
                error_message: "Укажите workAreaId",
                result: [],
            },
        ] satisfies ApiSchemas["OrderExecutionReleaseProductionEventResponse"];
    }

    const hasSignals = normalized === "207" || normalized === "504";

    if (!hasSignals) {
        return [
            {
                error_code: "OK",
                error_message: "",
                result: [],
                result_field_labels: [
                    { name: "event_description", label: "Наименование" },
                    { name: "registered_at", label: "Время" },
                    { name: "length_m", label: "Длина" },
                ],
            },
        ] satisfies ApiSchemas["OrderExecutionReleaseProductionEventResponse"];
    }

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    signal_id: "901",
                    event_description: "Списание сырьевого рулона",
                    event_name: "rawRelease",
                    registered_at: "15.07.2028 11:20:00",
                    length_m: 85.5,
                },
                {
                    signal_id: "902",
                    event_description: "Списание сырьевого рулона",
                    event_name: "rawRelease",
                    registered_at: "15.07.2028 12:05:10",
                    length_m: 42.0,
                },
            ],
            result_field_labels: [
                { name: "event_description", label: "Наименование" },
                { name: "registered_at", label: "Время" },
                { name: "length_m", label: "Длина" },
            ],
        },
    ] satisfies ApiSchemas["OrderExecutionReleaseProductionEventResponse"];
}
