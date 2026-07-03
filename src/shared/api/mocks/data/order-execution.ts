/** Элемент `result` в ответе `getOrderExecution`. */
export type MockOrderExecutionResultItem = {
    work_area_id: string | null;
    resource_id: string;
    sidebar_badges: { unprocessed_events_count: number }[];
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
        resource_id: "PR120",
        sidebar_badges: [{ unprocessed_events_count: 2 }],
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
                    resource_id: resourceCode,
                    sidebar_badges: [{ unprocessed_events_count: 0 }],
                    header: [],
                },
            ],
        },
    ];
}
