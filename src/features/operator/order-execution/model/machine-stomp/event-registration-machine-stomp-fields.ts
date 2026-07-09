export type EventRegistrationMachineStompFieldFormat = "integer" | "number";

export const EVENT_REGISTRATION_MACHINE_STOMP_FIELDS = [
    {
        key: "stops_count",
        label: "Стопов",
        unit: "шт.",
        format: "integer",
    },
    {
        key: "knife_hits_count",
        label: "Ударов ножа",
        unit: "шт.",
        format: "integer",
    },
    {
        key: "main_motor_speed",
        label: "Скорость машины",
        unit: "м/мин",
        format: "number",
    },
] as const satisfies ReadonlyArray<{
    key: string;
    label: string;
    unit: string;
    format: EventRegistrationMachineStompFieldFormat;
}>;
