export function buildMockPrintOrderExecutionMaterialReturnLabelResponse(
    workAreaId: string,
    materialRollId: string,
) {
    const normalizedWorkAreaId = workAreaId.trim();
    const normalizedMaterialRollId = materialRollId.trim();

    if (!normalizedWorkAreaId || !normalizedMaterialRollId) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите workAreaId и materialRollId",
                result: [],
            },
        ];
    }

    const barcode = "002429160   1";
    const nomenclatureName = "290A01-0010-0018";

    return [
        {
            error_message: "",
            error_code: "OK",
            result: [
                {
                    report_presenter_template_id: "users.admin.reports.mesReturnLabel",
                    report_make_succeeded: true,
                    nomenclature_name: nomenclatureName,
                    label_payload_json: "{}",
                    physical_print_enabled: false,
                    current_length_m: "",
                    report_parameters_json: JSON.stringify({
                        barcode,
                        operation_name: "2. Печать",
                        product_name: nomenclatureName,
                    }),
                    report_make_message: "OK",
                    template_code: "RETURN_LABEL",
                    print_preview_text: "PDF ready",
                    job_bag_document_id: "",
                    report_preview_file_path: `/admin/web/temp/mock_MES_RETURN_LABEL_${normalizedMaterialRollId}.pdf`,
                    report_path: "users.admin.reports.mesReturnLabel",
                    barcode,
                },
            ],
        },
    ];
}
