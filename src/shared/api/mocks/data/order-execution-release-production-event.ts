type MockProductionEvent = {
    machine_event_signal_id: string;
    register_action: string;
    event_code_label: string;
    event_code: string;
    event_display_rows: Array<{
        value_text: string;
        characteristic_label: string;
        unit_label: string;
    }>;
    informer_detail: string;
    event_at: string;
};

const PENDING_EVENTS_BY_WORK_AREA = new Map<string, MockProductionEvent[]>();

function cloneDefaultPendingEvents(): MockProductionEvent[] {
    return [
        {
            machine_event_signal_id: "783",
            register_action: "PREFILL_PROD",
            event_code_label: "Выпуск продукции",
            event_code: "prodRelease",
            event_display_rows: [
                {
                    value_text: "1200",
                    characteristic_label: "Длина выпуска",
                    unit_label: "м",
                },
                {
                    value_text: "480",
                    characteristic_label: "Вес нетто",
                    unit_label: "кг",
                },
            ],
            informer_detail: "Заполнить выпуск по сигналу машины",
            event_at: "2028-07-14 10:00:00",
        },
    ];
}

function getPendingEvents(workAreaId: string, withPendingEvent: boolean): MockProductionEvent[] {
    if (!withPendingEvent) {
        return [];
    }

    const existing = PENDING_EVENTS_BY_WORK_AREA.get(workAreaId);
    if (existing) {
        return existing;
    }

    const seed = cloneDefaultPendingEvents();
    PENDING_EVENTS_BY_WORK_AREA.set(workAreaId, seed);
    return seed;
}

export function buildMockEventReleaseProductionResponse(workAreaId: string, withPendingEvent = false) {
    const pendingEvents = getPendingEvents(workAreaId, withPendingEvent);
    const pendingCount = pendingEvents.length;
    const currentEvent = pendingEvents[0] ? [pendingEvents[0]] : [];

    return [
        {
            error_message: "",
            error_code: "OK",
            result: [
                {
                    pending_count: pendingCount,
                    empty_state_message: pendingCount === 0 ? "Событий с машины нет" : "",
                    work_area_id: workAreaId,
                    plate_title: "Событие с машины",
                    current_event: currentEvent,
                    manual_release_blocked: pendingCount > 0,
                },
            ],
        },
    ];
}

export function buildMockDiscardEventResponse(params: {
    workAreaId: string;
    machineEventSignalId: string;
}) {
    const queue = PENDING_EVENTS_BY_WORK_AREA.get(params.workAreaId) ?? cloneDefaultPendingEvents();
    const nextQueue = queue.filter((event) => event.machine_event_signal_id !== params.machineEventSignalId);
    PENDING_EVENTS_BY_WORK_AREA.set(params.workAreaId, nextQueue);

    const pendingCount = nextQueue.length;

    return [
        {
            error_message: "",
            error_code: "OK",
            result: [
                {
                    machine_event_signal_id: params.machineEventSignalId,
                    processing_status: "DISCARDED",
                    pending_count: pendingCount,
                    manual_release_blocked: pendingCount > 0,
                },
            ],
        },
    ];
}

function readPrefillFromEvent(event: MockProductionEvent | undefined): {
    prefill_output_length_m: number | null;
    prefill_output_weight_kg: number | null;
} {
    if (!event) {
        return { prefill_output_length_m: null, prefill_output_weight_kg: null };
    }

    const lengthRow = event.event_display_rows.find((row) =>
        row.characteristic_label.toLowerCase().includes("длин"),
    );
    const weightRow = event.event_display_rows.find((row) =>
        row.characteristic_label.toLowerCase().includes("вес"),
    );

    const parseValue = (value: string | undefined): number | null => {
        if (!value?.trim()) {
            return null;
        }
        const parsed = Number(value.replace(",", "."));
        return Number.isFinite(parsed) ? parsed : null;
    };

    return {
        prefill_output_length_m: parseValue(lengthRow?.value_text),
        prefill_output_weight_kg: parseValue(weightRow?.value_text),
    };
}

export function buildMockAcceptProdFromEventResponse(params: {
    workAreaId: string;
    machineEventSignalId: string;
}) {
    const queue = PENDING_EVENTS_BY_WORK_AREA.get(params.workAreaId) ?? cloneDefaultPendingEvents();
    const acceptedEvent = queue.find((event) => event.machine_event_signal_id === params.machineEventSignalId);
    const nextQueue = queue.filter((event) => event.machine_event_signal_id !== params.machineEventSignalId);
    PENDING_EVENTS_BY_WORK_AREA.set(params.workAreaId, nextQueue);

    const pendingCount = nextQueue.length;
    const prefill = readPrefillFromEvent(acceptedEvent);

    return [
        {
            error_message: "",
            error_code: "OK",
            result: [
                {
                    machine_event_signal_id: params.machineEventSignalId,
                    processing_status: "OPERATOR_ACCEPTED",
                    prefill_output_length_m: prefill.prefill_output_length_m,
                    prefill_output_weight_kg: prefill.prefill_output_weight_kg,
                    pending_count: pendingCount,
                    manual_release_blocked: pendingCount > 0,
                },
            ],
        },
    ];
}
