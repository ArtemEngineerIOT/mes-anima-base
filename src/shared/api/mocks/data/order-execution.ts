/** Элемент `result` в ответе `getOrderExecution`. */
export type MockOrderExecutionReleaseBlockItem = {
    work_area_id: string;
    unprocessed_count: number;
    processed_count: number;
    total_count: number;
    changed_at: string;
};

export type MockOrderExecutionWriteOffBlockItem = {
    work_area_id: string;
    unprocessed_count: number;
    processed_count: number;
    total_count: number;
    changed_at: string;
};

export type MockOrderExecutionMachineSignalsSummaryRow = {
    count: string | number;
    signal_name: string;
    signal_description: string;
};

export type MockOrderExecutionMachineSignalsBlockItem = {
    work_area_id: string;
    unprocessed_count: number;
    processed_count: number;
    total_count: number;
    last_event_at?: string;
    changed_at: string;
    summary?: MockOrderExecutionMachineSignalsSummaryRow[];
};

export type MockOrderExecutionResultItem = {
    work_area_id: string | null;
    start_work_area: string | null;
    resource_id: string;
    sidebar_badges: { unprocessed_events_count: number }[];
    release_block?: MockOrderExecutionReleaseBlockItem[];
    write_off_block?: MockOrderExecutionWriteOffBlockItem[];
    machine_signals_block?: MockOrderExecutionMachineSignalsBlockItem[];
    header: {
        product: string;
        project: string;
        client: string;
        order: string;
    }[];
};

const MOCK_ORDER_EXECUTION_RESULTS: Record<string, MockOrderExecutionResultItem> = {
    PR120: {
        work_area_id: "191",
        start_work_area: "22.07.2026 14:43:15",
        resource_id: "PR120",
        sidebar_badges: [{ unprocessed_events_count: 2 }],
        release_block: [
            {
                work_area_id: "191",
                unprocessed_count: 303,
                processed_count: 45,
                total_count: 348,
                changed_at: "05.08.2026 12:46:53",
            },
        ],
        write_off_block: [
            {
                work_area_id: "191",
                unprocessed_count: 21,
                processed_count: 0,
                total_count: 21,
                changed_at: "07.08.2026 12:20:39",
            },
        ],
        machine_signals_block: [
            {
                work_area_id: "191",
                unprocessed_count: 2,
                processed_count: 146,
                total_count: 148,
                changed_at: "07.08.2026 12:56:16",
            },
        ],
        header: [
            {
                project: "111780",
                product: "4045725 MMS Plain Black Currant 45g RU-BY FSI",
                order: "123345",
                client: 'ООО "Марс"',
            },
        ],
    },
    PR110: {
        work_area_id: "195",
        start_work_area: "22.07.2026 09:15:00",
        resource_id: "PR110",
        sidebar_badges: [{ unprocessed_events_count: 0 }],
        header: [
            {
                product: "SR00041 YORKSHIRE TERRIER ADULT 3 KG Gusset 110-G",
                project: "117972",
                client: 'АО "Рускан"',
                order: "514876",
            },
        ],
    },
    LM230: {
        work_area_id: "193",
        start_work_area: "22.07.2026 10:30:00",
        resource_id: "LM230",
        sidebar_badges: [{ unprocessed_events_count: 0 }],
        header: [
            {
                project: "111781",
                product: "MS Plain Apple 45g RU-BY FSI",
                order: "777020",
                client: 'ООО "C"',
            },
        ],
    },
};

export function buildMockOrderExecutionResponse(resourceCode: string) {
    const normalized = resourceCode.trim().toUpperCase();
    const resultItem = Object.entries(MOCK_ORDER_EXECUTION_RESULTS).find(
        ([code]) => code.toUpperCase() === normalized,
    )?.[1];

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                resultItem ?? {
                    work_area_id: null,
                    start_work_area: null,
                    resource_id: resourceCode,
                    sidebar_badges: [{ unprocessed_events_count: 0 }],
                    header: [],
                },
            ],
        },
    ];
}
