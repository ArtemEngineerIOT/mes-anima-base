import type { ApiSchemas } from "@/shared/api/schema";

export function buildMockReprintRollLabelBySeriesResponse(
    seriesRef: string,
): ApiSchemas["ReprintRollLabelBySeriesResponse"] {
    if (!seriesRef) {
        return [
            {
                error_code: "INVALID_INPUT",
                error_message: "Укажите seriesRef",
                result: [],
            },
        ];
    }

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    template_code: "LOCATION_ROLL_LABEL",
                    report_path: "users.admin.reports.mesInputLabel",
                    report_preview_file_path: `/admin/web/temp/mock_MES_LOCATION_ROLL_LABEL.pdf`,
                    report_make_succeeded: true,
                    report_make_message: "OK",
                    nomenclature_name: "BOPET CGPU 12 mc 1138 mm",
                    current_length_m: "690.500",
                    barcode: seriesRef,
                    physical_print_enabled: false,
                },
            ],
        },
    ];
}
