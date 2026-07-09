import type { ApiSchemas } from "@/shared/api/schema";

/** Мок initWizard (SCR-07 M1) — структура result согласована с маппером и макетом PR120. */
export function buildMockProductionEventWizardInitResponse(
    workAreaId: string,
): ApiSchemas["OrderExecutionProductionEventWizardInitResponse"] {
    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    work_area_id: workAreaId,
                    wizard_session_id: `wiz-${workAreaId}-mock`,
                    setup_run_tags: [
                        { tag: "Zerropull", label: "0 — Zerropull" },
                        { tag: "A", label: "A" },
                        { tag: "B", label: "B" },
                        { tag: "C", label: "C" },
                        { tag: "D", label: "D" },
                        { tag: "E", label: "E" },
                    ],
                    event_codes: [
                        {
                            code: 117,
                            name: "Устранение розлива",
                            requires_time: true,
                            requires_length: false,
                            requires_comment: true,
                            requires_setup_runs: false,
                        },
                        {
                            code: 120,
                            name: "Настройка",
                            requires_time: true,
                            requires_length: true,
                            requires_comment: false,
                            requires_setup_runs: true,
                        },
                        {
                            code: 121,
                            name: "Тонирование",
                            requires_time: true,
                            requires_length: true,
                            requires_comment: true,
                            requires_setup_runs: false,
                        },
                        {
                            code: 141,
                            name: "Брызги краски",
                            requires_time: true,
                            requires_length: true,
                            requires_comment: false,
                            requires_setup_runs: false,
                        },
                        {
                            code: 113,
                            name: "Плановое ТО",
                            requires_time: true,
                            requires_length: false,
                            requires_comment: false,
                            requires_setup_runs: false,
                        },
                    ],
                    unprocessed_signals: [
                        {
                            signal_id: "ue-1",
                            signal_name: "Удар ножа",
                            time_start: "03-11-2028 10:15:00",
                            time_end: "03-11-2028 10:15:12",
                            length_start_m: "1240",
                            length_end_m: "1245",
                        },
                        {
                            signal_id: "ue-2",
                            signal_name: "Удар ножа",
                            time_start: "03-11-2028 10:10:00",
                            time_end: "03-11-2028 10:10:08",
                            length_start_m: "1180",
                            length_end_m: "1185",
                        },
                    ],
                    rolls_removed_pipeline: [{ label: "0 — рулон для брака", ref: "0" }],
                    rolls_registered_pipeline: [
                        { label: "PR1", ref: "PR1" },
                        { label: "PR2", ref: "PR2" },
                        { label: "PR3", ref: "PR3" },
                    ],
                    defaults: [
                        {
                            material_roll_ref_removed: "0 — рулон для брака",
                            material_roll_ref_registered: "PR1",
                        },
                    ],
                    line_count: 12,
                    line_numbers: [
                        { line_number: "1" },
                        { line_number: "2" },
                        { line_number: "3" },
                        { line_number: "4" },
                        { line_number: "5" },
                        { line_number: "6" },
                        { line_number: "7" },
                        { line_number: "8" },
                        { line_number: "9" },
                        { line_number: "10" },
                        { line_number: "11" },
                        { line_number: "12" },
                    ],
                    sides: [{ code: "PM" }, { code: "PASSER" }],
                    card_colors: [
                        { code: "BLUE", label: "Синяя" },
                        { code: "YELLOW", label: "Жёлтая" },
                        { code: "GREEN", label: "Зелёная" },
                        { code: "RED", label: "Красная" },
                    ],
                },
            ],
        },
    ];
}
