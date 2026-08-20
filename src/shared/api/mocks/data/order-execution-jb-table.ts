const MOCK_JB_TABLE_ROWS = [
    {
        id: 1,
        description: "Информация по этапу",
        action: true,
        status: true,
    },
    {
        id: 2,
        description: "Список цилиндров",
        action: true,
        status: true,
    },
    {
        id: 3,
        description: "Карта технологических параметров печати",
        action: true,
        status: true,
    },
    {
        id: 4,
        description: "Рецептура красок",
        action: true,
        status: true,
    },
    {
        id: 5,
        description: "Этикетка на секцию",
        action: true,
        status: true,
    },
    {
        id: 6,
        description: "Process control",
        action: true,
        status: true,
    },
    {
        id: 7,
        description: "Карта контроля цвета",
        action: true,
        status: true,
    },
    {
        id: 8,
        description: "JB",
        action: true,
        status: true,
    },
] as const;

export function buildMockJbTableResponse(machineId: string) {
    const normalized = machineId.trim().toUpperCase();
    if (!normalized) {
        return [];
    }

    if (normalized !== "PR120") {
        return [];
    }

    return MOCK_JB_TABLE_ROWS.map((row) => ({ ...row }));
}
