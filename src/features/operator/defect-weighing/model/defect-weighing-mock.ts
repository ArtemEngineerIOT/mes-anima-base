import type { DefectWeighingJournalRow } from "./types";

export const MOCK_DEFECT_WEIGHING_JOURNAL: DefectWeighingJournalRow[] = [
    {
        id: "j1",
        stageLabel: "123456",
        registeredAt: "03-11-2028 12:00:00",
        weightKg: 18,
        defectLabel: "Обрыв материала",
        note: "Замена термопары",
    },
];
