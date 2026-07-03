import type { ApiSchemas } from "@/shared/api/schema";

export const MOCK_LIST_BLOCK_REASONS_RESPONSE: ApiSchemas["ListBlockReasonsResponse"] = [
    {
        error_code: "OK",
        error_message: "",
        result: [
            {
                reason_code: "BLOCK_CURING_VIOLATION",
                reason_label: "Нарушение выдержки",
                source: "STUB_V1",
            },
            {
                reason_code: "BLOCK_BROKEN_ROLLS",
                reason_label: "Битые рулоны",
                source: "STUB_V1",
            },
            {
                reason_code: "BLOCK_MATERIAL_DELAMINATION",
                reason_label: "Расслоение материала",
                source: "STUB_V1",
            },
            {
                reason_code: "BLOCK_UNEVEN_EDGE",
                reason_label: "Неровный край",
                source: "STUB_V1",
            },
            {
                reason_code: "BLOCK_WAVES",
                reason_label: "Волны",
                source: "STUB_V1",
            },
        ],
    },
];
