const MOCK_RELEASE_EVENT_FIELD_LABELS = [
    { name: "signal_id", label: "ID" },
    { name: "event_description", label: "Имя" },
    { name: "registered_at", label: "Время" },
    { name: "length_m", label: "Длина, м" },
    { name: "event_name", label: "Код события" },
] as const;

const MOCK_RELEASE_EVENTS = [
    {
        registered_at: "24.07.2026 08:32:48",
        event_description: "Выпуск продукта",
        event_name: "prodRelease",
        signal_id: "232",
        length_m: 7926.0,
    },
    {
        registered_at: "24.07.2026 10:02:15",
        event_description: "Выпуск продукта",
        event_name: "prodRelease",
        signal_id: "237",
        length_m: 17993.0,
    },
    {
        registered_at: "24.07.2026 10:52:41",
        event_description: "Выпуск продукта",
        event_name: "prodRelease",
        signal_id: "241",
        length_m: 17538.0,
    },
    {
        registered_at: "24.07.2026 13:57:02",
        event_description: "Выпуск продукта",
        event_name: "prodRelease",
        signal_id: "246",
        length_m: 17700.0,
    },
    {
        registered_at: "24.07.2026 14:34:04",
        event_description: "Выпуск продукта",
        event_name: "prodRelease",
        signal_id: "248",
        length_m: 12829.0,
    },
    {
        registered_at: "24.07.2026 14:56:45",
        event_description: "Выпуск продукта",
        event_name: "prodRelease",
        signal_id: "253",
        length_m: 3008.0,
    },
    {
        registered_at: "24.07.2026 17:13:32",
        event_description: "Выпуск продукта",
        event_name: "prodRelease",
        signal_id: "260",
        length_m: 13044.0,
    },
    {
        registered_at: "24.07.2026 17:50:58",
        event_description: "Выпуск продукта",
        event_name: "prodRelease",
        signal_id: "262",
        length_m: 13150.0,
    },
    {
        registered_at: "24.07.2026 18:41:05",
        event_description: "Выпуск продукта",
        event_name: "prodRelease",
        signal_id: "264",
        length_m: 17529.0,
    },
    {
        registered_at: "24.07.2026 19:32:54",
        event_description: "Выпуск продукта",
        event_name: "prodRelease",
        signal_id: "268",
        length_m: 18023.0,
    },
    {
        registered_at: "24.07.2026 20:29:17",
        event_description: "Выпуск продукта",
        event_name: "prodRelease",
        signal_id: "273",
        length_m: 13015.0,
    },
    {
        registered_at: "24.07.2026 21:04:22",
        event_description: "Выпуск продукта",
        event_name: "prodRelease",
        signal_id: "277",
        length_m: 12279.0,
    },
] as const;

export function buildMockEventReleaseProductionResponse(workAreaId: string, withPendingEvent = false) {
    void workAreaId;

    if (!withPendingEvent) {
        return [
            {
                error_message: "",
                error_code: "OK",
                result: [],
                result_field_labels: [...MOCK_RELEASE_EVENT_FIELD_LABELS],
            },
        ];
    }

    return [
        {
            error_message: "",
            error_code: "OK",
            result: [...MOCK_RELEASE_EVENTS],
            result_field_labels: [...MOCK_RELEASE_EVENT_FIELD_LABELS],
        },
    ];
}
