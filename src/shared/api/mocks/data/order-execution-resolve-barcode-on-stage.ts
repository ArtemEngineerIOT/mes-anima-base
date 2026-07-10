import {
    MOCK_WA207_ACTIVE_INPUT_ROLL,
    MOCK_WA207_ACTIVE_INPUT_SERIES_KEY,
} from "./order-execution-resolve-barcode-mock-constants";

export function buildMockResolveBarcodeOnStageResponse(
    barcode: string,
    workAreaId?: string,
    installationPlace: "WAITING" | "ON_UNWIND" = "WAITING",
) {
    const rawBarcode = barcode;
    const normalized = barcode.trim();
    const normalizedWorkAreaId = workAreaId?.trim() ?? "";

    if (!normalized) {
        return [
            {
                error_code: "INVALID_INPUT",
                error_message: "Укажите штрихкод серии",
                result: [],
            },
        ];
    }

    if (normalizedWorkAreaId === "207" && rawBarcode !== MOCK_WA207_ACTIVE_INPUT_SERIES_KEY) {
        return [
            {
                error_message: "",
                error_code: "OK",
                result: [
                    {
                        stage_spec_status: "MATCHED",
                        stage_spec_banner_detail: "",
                        already_registered_on_stage: false,
                        scan_blocked_by_active_input: true,
                        stage_spec_banner_title: "На входе уже есть активный рулон",
                        material_roll_id: "",
                        stage_spec_banner_visible: true,
                        stage_registry_refresh_hint: false,
                        presence_refresh_hint: false,
                        series_card: [],
                        roll_trace_context_id: "",
                        presence_status: installationPlace,
                    },
                ],
            },
        ];
    }

    if (normalized === "00000000") {
        return [
            {
                error_code: "NOT_FOUND",
                error_message: "Серия не найдена",
                result: [],
            },
        ];
    }

    if (normalized === "00280101") {
        return [
            {
                error_message: "",
                error_code: "OK",
                result: [
                    {
                        stage_spec_status: "NOT_IN_SPEC",
                        stage_spec_banner_detail:
                            "Отсканированная серия отсутствует в основных/альтернативных материалах заказа",
                        already_registered_on_stage: false,
                        stage_spec_banner_title: "Серия отсутствует в спецификации этапа",
                        material_roll_id: "",
                        stage_spec_banner_visible: true,
                        stage_registry_refresh_hint: false,
                        presence_refresh_hint: false,
                        series_card: [],
                        roll_trace_context_id: "",
                        presence_status: installationPlace,
                    },
                ],
            },
        ];
    }

    const isWa207ActiveSeries =
        normalizedWorkAreaId === "207" && rawBarcode === MOCK_WA207_ACTIVE_INPUT_SERIES_KEY;

    return [
        {
            error_message: "",
            error_code: "OK",
            result: [
                {
                    stage_spec_status: "MATCHED",
                    stage_spec_banner_detail: "",
                    already_registered_on_stage: isWa207ActiveSeries,
                    scan_blocked_by_active_input: false,
                    stage_spec_banner_title: "",
                    material_roll_id: isWa207ActiveSeries ? MOCK_WA207_ACTIVE_INPUT_ROLL.material_roll_id : "30",
                    stage_spec_banner_visible: false,
                    stage_registry_refresh_hint: true,
                    presence_refresh_hint: true,
                    write_off_form_enabled: installationPlace === "ON_UNWIND",
                    series_card: [
                        {
                            nomenclature_name: isWa207ActiveSeries
                                ? MOCK_WA207_ACTIVE_INPUT_ROLL.nomenclature_name
                                : "RAW MATERIAL DWH STUB",
                            quantity_uom: "MTR",
                            current_length_m: isWa207ActiveSeries
                                ? MOCK_WA207_ACTIVE_INPUT_ROLL.current_length_m
                                : 100.0,
                            series_ref: rawBarcode,
                            nomenclature_code: isWa207ActiveSeries
                                ? MOCK_WA207_ACTIVE_INPUT_ROLL.nomenclature_code
                                : "RAW-MAT-STUB-001",
                            external_series_key: rawBarcode,
                            current_weight_kg: isWa207ActiveSeries ? 0 : 33.0,
                            is_semi_finished: false,
                        },
                    ],
                    roll_trace_context_id: isWa207ActiveSeries
                        ? MOCK_WA207_ACTIVE_INPUT_ROLL.roll_trace_context_id
                        : "28",
                    presence_status: installationPlace,
                },
            ],
        },
    ];
}
