import type { DefectEventCode } from "./types";

/** Машина по умолчанию для технической УЗ АРМ (пока фиксированно). */
export const DEFECT_WEIGHING_DEFAULT_RESOURCE_CODE = "PR120";

/** Демо-вес с интегрированных весов (US-68). */
export const DEFECT_WEIGHING_MOCK_SCALE_WEIGHT_KG = "250";

export const DEFECT_WEIGHING_POPULAR_EVENT_CODES: DefectEventCode[] = [
    { code: "101", label: "Обрыв материала", isPopular: true },
    { code: "102", label: "Отклонение цвета", isPopular: true },
    { code: "103", label: "Тонирование", isPopular: true },
    { code: "104", label: "Брызги краски", isPopular: true },
    { code: "105", label: "Засаливание", isPopular: true },
    { code: "106", label: "Приводка печати", isPopular: true },
    { code: "107", label: "Потери на настройку", isPopular: true },
    { code: "108", label: "Остаток на гильзе", isPopular: true },
    { code: "109", label: "Верхние витки", isPopular: true },
];

export const DEFECT_WEIGHING_EXTRA_EVENT_CODES: DefectEventCode[] = [
    { code: "137", label: "Накат", isPopular: false },
    { code: "138", label: "Складки", isPopular: false },
    { code: "139", label: "Пятна", isPopular: false },
];

export const DEFECT_WEIGHING_ALL_EVENT_CODES: DefectEventCode[] = [
    ...DEFECT_WEIGHING_POPULAR_EVENT_CODES,
    ...DEFECT_WEIGHING_EXTRA_EVENT_CODES,
];

export function buildDefectWeighingScaleOptions(resourceCode: string): { id: string; label: string }[] {
    const normalized = resourceCode.trim().toUpperCase();
    if (!normalized) {
        return [];
    }

    return [
        { id: `${normalized}_IN`, label: `${normalized}_IN` },
        { id: `${normalized}_OUT`, label: `${normalized}_OUT` },
    ];
}

export function formatDefectEventOptionLabel(code: DefectEventCode): string {
    return `${code.code} — ${code.label}`;
}
