function buildErrorResponse(message: string) {
    return [{ error_code: "VALIDATION", error_message: message, result: [] }];
}

const MOCK_DESTINATION_WAREHOUSES = [
    { warehouse_code: "WH100", warehouse_label: "Склад 100" },
    { warehouse_code: "WH200", warehouse_label: "Склад 200" },
    { warehouse_code: "WH300", warehouse_label: "Склад 300" },
    { warehouse_code: "WH400", warehouse_label: "Склад 400" },
];

export function buildMockReleaseFormInitResponse(workAreaId: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    const releaseCountOnWorkArea = normalized === "207" ? 15 : 2;
    const nextRollIndex = releaseCountOnWorkArea + 1;
    const seriesBase = normalized === "207" ? "514249" : normalized;

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: normalized,
                    next_roll_index: nextRollIndex,
                    predicted_external_series_key: `${seriesBase} ${nextRollIndex}`,
                    default_destination_warehouse_code: "WH100",
                    destination_warehouses: MOCK_DESTINATION_WAREHOUSES,
                    release_count_on_work_area: releaseCountOnWorkArea,
                    series_base: seriesBase,
                },
            ],
        },
    ];
}

const MOCK_BATCH_ROW = {
    nomenclature_name: "DEMO-OUT-NOM",
    nomenclature_code: "DEMO-OUT-NOM",
    uom_primary: "KG",
    uom_secondary: "M",
    roll_status: "RELEASED",
    roll_status_label: "Выпущен",
    blocked: false,
    block_reason_code: "",
    status_label: "Доступно",
} as const;

const MOCK_BATCH_ROWS_207 = [
    {
        ...MOCK_BATCH_ROW,
        barcode: "OUT-207-2",
        external_series_key: "514249-2",
        material_roll_id: "77",
        roll_trace_context_id: "71",
        material_production_release_id: "12",
        quantity_primary: 33.0,
        quantity_secondary: 100.0,
    },
    {
        ...MOCK_BATCH_ROW,
        barcode: "OUT-207-3",
        external_series_key: "514249-3",
        material_roll_id: "78",
        roll_trace_context_id: "72",
        material_production_release_id: "13",
        quantity_primary: 3.3,
        quantity_secondary: 10.0,
    },
    {
        ...MOCK_BATCH_ROW,
        barcode: "514249 13",
        external_series_key: "514249 13",
        material_roll_id: "92",
        roll_trace_context_id: "86",
        material_production_release_id: "25",
        quantity_primary: 4.4,
        quantity_secondary: 11.1,
    },
    {
        ...MOCK_BATCH_ROW,
        barcode: "514249 15",
        external_series_key: "514249 15",
        material_roll_id: "94",
        roll_trace_context_id: "88",
        material_production_release_id: "27",
        quantity_primary: 4.4,
        quantity_secondary: 10.0,
    },
];

export function buildMockBatchReleasesResponse(workAreaId: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    const isDemoStage = normalized === "207";
    const batchRows = isDemoStage
        ? MOCK_BATCH_ROWS_207
        : [
              {
                  ...MOCK_BATCH_ROW,
                  barcode: `OUT-${normalized}-1`,
                  external_series_key: `${normalized}-1`,
                  material_roll_id: "1",
                  roll_trace_context_id: "1",
                  material_production_release_id: "1",
                  quantity_primary: 33.0,
                  quantity_secondary: 100.0,
              },
          ];

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: normalized,
                    as_of: "Sat Jun 27 00:54:27 MSK 2026",
                    release_count_on_work_area: isDemoStage ? 15 : batchRows.length,
                    batch_rows: batchRows,
                },
            ],
        },
    ];
}

export function buildMockStageInputRollsResponse(workAreaId: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    const inputRollBase = {
        nomenclature_code: "290A01-0010-0018",
        uom_primary: "KGM",
        uom_secondary: "MTR",
    };

    const inputRolls =
        normalized === "207"
            ? [
                  {
                      ...inputRollBase,
                      nomenclature_name: "002429160   1",
                      external_series_key: "002429160   1",
                      material_roll_id: "49",
                      stage_input_card_status: "ACTIVE",
                      quantity_secondary: 50.0,
                      roll_trace_context_id: "43",
                      roll_status_label: "IN_WORK",
                      quantity_primary: 24.0,
                      meter_card_id: "73",
                      barcode: "002429160   1",
                      roll_status: "IN_WORK",
                  },
                  {
                      ...inputRollBase,
                      nomenclature_name: "002429160   13",
                      external_series_key: "002429160   13",
                      material_roll_id: "50",
                      stage_input_card_status: "ACTIVE",
                      quantity_secondary: 63.0,
                      roll_trace_context_id: "44",
                      roll_status_label: "IN_WORK",
                      quantity_primary: 20.79,
                      meter_card_id: "78",
                      barcode: "002429160   13",
                      roll_status: "IN_WORK",
                  },
                  {
                      ...inputRollBase,
                      nomenclature_name: "002429160   14",
                      external_series_key: "002429160   14",
                      material_roll_id: "58",
                      stage_input_card_status: "CLOSED",
                      quantity_secondary: 0.0,
                      roll_trace_context_id: "52",
                      roll_status_label: "WRITTEN_OFF",
                      quantity_primary: 0.0,
                      meter_card_id: "76",
                      barcode: "002429160   14",
                      roll_status: "WRITTEN_OFF",
                  },
              ]
            : [
                  {
                      ...inputRollBase,
                      nomenclature_name: "0028010 1",
                      external_series_key: "0028010 1",
                      material_roll_id: "1",
                      stage_input_card_status: "ACTIVE",
                      quantity_secondary: 4521.0,
                      roll_trace_context_id: "1",
                      roll_status_label: "IN_WORK",
                      quantity_primary: 1960.0,
                      meter_card_id: "1",
                      barcode: "0028010 1",
                      roll_status: "IN_WORK",
                  },
              ];

    return [
        {
            error_code: "",
            error_message: "",
            work_area_id: normalized,
            input_rolls: inputRolls,
        },
    ];
}

export function buildMockRegisterReleaseResponse(
    workAreaId: string,
    seriesKey: string,
    length: number,
    weight: number,
) {
    const normalizedWorkAreaId = workAreaId.trim();
    const normalizedSeriesKey = seriesKey.trim();

    if (!normalizedWorkAreaId || !normalizedSeriesKey) {
        return buildErrorResponse("Укажите workAreaId и seriesKey");
    }

    if (!Number.isFinite(length) || length <= 0 || !Number.isFinite(weight) || weight <= 0) {
        return buildErrorResponse("Укажите метраж и вес больше нуля");
    }

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    release_status: "LOCKED",
                    integration_1s_status: "ACCEPTED",
                    batch_releases_refresh_hint: true,
                    external_series_key: normalizedSeriesKey,
                    material_roll_id: "99",
                    traceability_output_recorded: true,
                },
            ],
        },
    ];
}

export function buildMockPrepareReleaseLabelResponse(
    workAreaId: string,
    materialProductionReleaseId: string,
) {
    const normalizedWorkAreaId = workAreaId.trim();
    const normalizedReleaseId = materialProductionReleaseId.trim();

    if (!normalizedWorkAreaId || !normalizedReleaseId) {
        return buildErrorResponse("Укажите workAreaId и materialProductionReleaseId");
    }

    const barcode = `OUT-${normalizedWorkAreaId}-${normalizedReleaseId}`;

    return [
        {
            error_message: "",
            error_code: "OK",
            result: [
                {
                    report_presenter_template_id: "users.admin.reports.mesReleaseLabel",
                    report_make_succeeded: true,
                    nomenclature_name: "DEMO-OUT-NOM",
                    label_payload_json: "{}",
                    physical_print_enabled: false,
                    current_length_m: "",
                    report_parameters_json: JSON.stringify({
                        barcode,
                        operation_name: "Печать этикетки выпуска",
                        product_name: "DEMO-OUT-NOM",
                    }),
                    report_make_message: "OK",
                    template_code: "RELEASE_LABEL",
                    print_preview_text: "PDF ready",
                    job_bag_document_id: "",
                    report_preview_file_path: `/admin/web/temp/mock_MES_RELEASE_LABEL_${normalizedReleaseId}.pdf`,
                    report_path: "users.admin.reports.mesReleaseLabel",
                    barcode,
                },
            ],
        },
    ];
}
