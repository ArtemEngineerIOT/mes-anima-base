import type { ApiSchemas } from "@/shared/api/schema";

const KNOWN_REASON_CODES = new Set([
    "BLOCK_CURING_VIOLATION",
    "BLOCK_BROKEN_ROLLS",
    "BLOCK_MATERIAL_DELAMINATION",
    "BLOCK_UNEVEN_EDGE",
    "BLOCK_WAVES",
]);

export function buildMockSubmitBlockRequestResponse(
    request: ApiSchemas["SubmitBlockRequestItem"],
): ApiSchemas["SubmitBlockResponse"] {
    if (!request.seriesRefs?.trim()) {
        return [
            {
                error_code: "INVALID_INPUT",
                error_message: "Укажите seriesRefs",
                result: [],
            },
        ];
    }

    if (!request.reasonCode?.trim()) {
        return [
            {
                error_code: "INVALID_INPUT",
                error_message: "Укажите reasonCode",
                result: [],
            },
        ];
    }

    if (!KNOWN_REASON_CODES.has(request.reasonCode.trim())) {
        return [
            {
                error_code: "UNKNOWN_REASON_CODE",
                error_message: `Неизвестный код причины: ${request.reasonCode}`,
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
                    request_status: "ACCEPTED",
                    external_1s_ref: "STUB_1S_REF",
                    display_message:
                        "Блокировка принята в 1S (stub). Остатки обновятся после репликации.",
                },
            ],
        },
    ];
}
