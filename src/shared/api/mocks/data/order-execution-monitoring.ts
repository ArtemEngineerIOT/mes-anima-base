function buildErrorResponse(message: string) {
    return [{ error_code: "INVALID_INPUT", error_message: message, result: [] }];
}

type MockLineMeters = {
    input_total: number;
    input_roll: number;
    output_total: number;
    output_roll: number;
};

const MOCK_LINE_METERS_BY_WORK_AREA: Record<string, MockLineMeters> = {
    "207": {
        input_total: 900,
        input_roll: 580,
        output_total: 865,
        output_roll: 120,
    },
};

const DEFAULT_LINE_METERS: MockLineMeters = {
    input_total: 1200,
    input_roll: 300,
    output_total: 1100,
    output_roll: 250,
};

function buildLineMetersPayload(lineMeters: MockLineMeters) {
    return [
        {
            input: [
                {
                    input_total: lineMeters.input_total,
                    input_roll: lineMeters.input_roll,
                },
            ],
            output: [
                {
                    output_total: lineMeters.output_total,
                    output_roll: lineMeters.output_roll,
                },
            ],
        },
    ];
}

export function buildMockArmExecutionMonitoringSummaryResponse(workAreaId: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    const lineMeters = MOCK_LINE_METERS_BY_WORK_AREA[normalized] ?? DEFAULT_LINE_METERS;

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: normalized,
                    line_meters: buildLineMetersPayload(lineMeters),
                },
            ],
        },
    ];
}

const MOCK_INPUT_ROLLS_207 = [
    { barcode: "IN-207-1", length_m: 580.0 },
    { barcode: "IN-207-2", length_m: 200.0 },
    { barcode: "IN-207-3", length_m: 120.0 },
];

const MOCK_OUTPUT_ROLLS_207 = [
    { barcode: "OUT-207-1", length_m: 420.0, composition: "IN-207-1;IN-207-2", blocked: false, block_reason_label: "-" },
    { barcode: "OUT-207-2", length_m: 320.0, composition: "IN-207-2;IN-207-3", blocked: false, block_reason_label: "-" },
    { barcode: "OUT-207-3", length_m: 120.0, composition: "IN-207-3", blocked: true, block_reason_label: "Испорчен" },
];

const DEFAULT_INPUT_ROLLS = [
    { barcode: "IN-1", length_m: 200.0 },
    { barcode: "IN-2", length_m: 180.0 },
];

const DEFAULT_OUTPUT_ROLLS = [
    { barcode: "OUT-1", length_m: 300.0, composition: "IN-1;IN-2", blocked: false, block_reason_label: "-" },
    { barcode: "OUT-2", length_m: 250.0, composition: "IN-2", blocked: false, block_reason_label: "-" },
];

function slicePreviewRows<T>(rows: T[], previewLimit: string): T[] {
    const parsedLimit = Number.parseInt(previewLimit, 10);
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
        return rows;
    }

    return rows.slice(0, parsedLimit);
}

export function buildMockArmExecutionMonitoringRollTablesResponse(workAreaId: string, previewLimit = "3") {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    const inputRolls = normalized === "207" ? MOCK_INPUT_ROLLS_207 : DEFAULT_INPUT_ROLLS;
    const outputRolls = normalized === "207" ? MOCK_OUTPUT_ROLLS_207 : DEFAULT_OUTPUT_ROLLS;
    const limit = previewLimit.trim() || "3";

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: normalized,
                    preview_limit: limit,
                    input_rolls: slicePreviewRows(inputRolls, limit),
                    output_rolls: slicePreviewRows(outputRolls, limit),
                },
            ],
        },
    ];
}

const MOCK_STAGE_EVENTS_207 = [
    { row_kind: "DEFECT", row_label: "Брак", quantity_uom: "м", quantity: 1050 },
    { row_kind: "DOWNTIME", row_label: "Простои", quantity_uom: "ч", quantity: 3 },
];

const DEFAULT_STAGE_EVENTS = [
    { row_kind: "DEFECT", row_label: "Брак", quantity_uom: "м", quantity: 10 },
    { row_kind: "DOWNTIME", row_label: "Простои", quantity_uom: "ч", quantity: 1 },
];

export function buildMockArmExecutionMonitoringStageEventsResponse(workAreaId: string) {
    const normalized = workAreaId.trim();
    if (!normalized) {
        return buildErrorResponse("Укажите workAreaId");
    }

    const eventSummaryRows = normalized === "207" ? MOCK_STAGE_EVENTS_207 : DEFAULT_STAGE_EVENTS;

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: normalized,
                    event_summary_rows: eventSummaryRows,
                },
            ],
        },
    ];
}
