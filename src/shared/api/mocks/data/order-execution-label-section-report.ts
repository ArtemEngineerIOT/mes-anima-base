export function buildMockJbLabelSectionResponse() {
    return [
        {
            error_message: "",
            error_code: "OK",
            result: [
                {
                    report_presenter_template_id: "users.admin.reports.mesSectionLabel",
                    report_make_succeeded: true,
                    nomenclature_name: "",
                    label_payload_json: "{}",
                    physical_print_enabled: false,
                    current_length_m: "",
                    report_parameters_json: "{}",
                    report_make_message: "OK",
                    template_code: "SECTION_LABEL",
                    print_preview_text: "PDF ready",
                    job_bag_document_id: "",
                    report_preview_file_path: "/admin/web/temp/mock_MES_SECTION_LABEL.pdf",
                    report_path: "users.admin.reports.mesSectionLabel",
                    barcode: "",
                },
            ],
        },
    ];
}
