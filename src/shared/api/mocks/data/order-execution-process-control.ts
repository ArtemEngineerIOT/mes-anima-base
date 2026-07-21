function buildEncodedData(workAreaId: string) {
    return JSON.stringify({
        meta: { ui: "process_control_screen", smoke: "bff_operator_fill" },
        fields: { work_area_id: workAreaId },
        source: "operator",
        tables: {
            checklist: [
                {
                    item_code: "MIXER_METALLIC",
                    item_label: "Миксер на метализированной краске включен",
                    checked: true,
                    value: "",
                },
                {
                    item_code: "LIGHTGUIDE_CLEAN",
                    item_label: "Чистота зеркала и линзы световода проверены",
                    checked: true,
                    value: "",
                },
                {
                    item_code: "CS_LEVEL",
                    item_label: "Визуальная проверка уровня CS в ёмкости",
                    checked: true,
                    value: "",
                },
                {
                    item_code: "ES_BARS",
                    item_label: "Положение электростатических планок",
                    checked: true,
                    value: "",
                },
                {
                    item_code: "CAMERA_PARAMS",
                    item_label:
                        "Параметры камеры контроля соответствуют целевым значениям (проверка на старте)",
                    checked: true,
                    value: "",
                },
                {
                    item_code: "DRAUGHT_GAUGES",
                    item_label: "Тягонапоромеры",
                    checked: true,
                    value: "0 / -0,4",
                },
            ],
            numeric_values: [{ code: "presser_width", value: "530" }],
        },
        readiness: "READY",
        captured_at: "2026-07-17 15:28:29",
        captured_by: "operator-arm-smoke",
        stub_fields: [],
        document_type: "process_control",
        schema_version: "1",
    });
}

function buildErrorResponse(message: string) {
    return [{ error_code: "INVALID_INPUT", error_message: message, result: [] }];
}

export function buildMockProcessControlResponse(workAreaId: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: normalized,
                    updated_at: "2026-07-17 15:28:31",
                    encoded_data: buildEncodedData(normalized),
                    status: "SAVED",
                },
            ],
        },
    ];
}

export function buildMockSaveProcessControlResponse(workAreaId: string, payloadJson: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: normalized,
                    updated_at: "2026-07-17 15:30:00",
                    encoded_data: payloadJson,
                    status: "SAVED",
                },
            ],
        },
    ];
}
