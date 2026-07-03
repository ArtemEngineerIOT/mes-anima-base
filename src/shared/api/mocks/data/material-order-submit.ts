import type { ApiSchemas } from "@/shared/api/schema";

export function buildMockMaterialOrderSubmitResponse(
    body: ApiSchemas["MaterialOrderSubmitRequest"],
) {
    const item = body[0];
    const workAreaIds = item?.workAreaIds?.trim();

    if (!workAreaIds) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите workAreaIds",
                result: [],
            },
        ];
    }

    const linesCount = item?.lines?.length ?? 0;
    const requestId = "41";
    const documentRef = `STUB-1S-MAT-${requestId}`;

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    material_delivery_request_id: requestId,
                    submit_banner_visible: true,
                    order_results: [],
                    submit_banner_detail: `Заявка принята учётной системой (режим заглушки).. Документ 1S: ${documentRef}`,
                    order_result: [
                        {
                            request_status: "ACCEPTED",
                            error_message: "Заявка принята учётной системой (режим заглушки).",
                            line_count: linesCount || 1,
                            external_1s_document_ref: documentRef,
                            error_code: "",
                            operator_message: "Заявка принята учётной системой (режим заглушки).",
                        },
                    ],
                    last_submit_at: "",
                    submit_banner_title: "Заявка принята",
                },
            ],
        },
    ];
}
