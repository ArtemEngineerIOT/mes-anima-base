import type { ApiSchemas } from "@/shared/api/schema";

export function buildMockProductionEventRegisterResponse(): ApiSchemas["OrderExecutionProductionEventRegisterResponse"] {
    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    production_event_id: `pe-${Date.now()}`,
                    registration_status: "REGISTERED",
                    registration_status_label: "Зарегистрирован",
                    process_journal_refresh_hint: true,
                },
            ],
        },
    ];
}
