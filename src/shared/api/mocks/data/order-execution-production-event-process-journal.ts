import type { ApiSchemas } from "@/shared/api/schema";

/** Мок getProcessJournal (SCR-07 M8) — структура result согласована с макетом. */
export function buildMockProductionEventProcessJournalResponse(
    workAreaId: string,
): ApiSchemas["OrderExecutionProductionEventProcessJournalResponse"] {
    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: workAreaId,
                    total_length_m: 11000,
                    total_length_m_label: "11 000",
                    journal_rows: [
                        {
                            production_event_id: "j-120",
                            event_code_label: "120 — Настройка",
                            time_start_label: "10:00:00",
                            time_end_label: "12:00:00",
                            length_m: "1000",
                            details: {
                                material_roll_label: "0 — Рулон для брака",
                                length_start_m: "0",
                                length_end_m: "1000",
                                registration_status_label: "Удален",
                                comment: "Необходимо взвесить в конце смены",
                                setup_run_tags_label: "0, A, B, C",
                            },
                        },
                        {
                            production_event_id: "j-141",
                            event_code_label: "141 — Брызги краски",
                            time_start_label: "11:00:00",
                            time_end_label: "12:30:00",
                            length_m: "500",
                        },
                        {
                            production_event_id: "j-131",
                            event_code_label: "131 — Чистка: Устранение розлива",
                            time_start_label: "13:00:00",
                            time_end_label: "14:30:00",
                            length_m: "5700",
                        },
                        {
                            production_event_id: "j-110",
                            event_code_label: "110 — Производство: Потеря скорости",
                            time_start_label: "10:00:00",
                            time_end_label: "17:00:00",
                            length_m: "1200",
                        },
                    ],
                },
            ],
        },
    ];
}
