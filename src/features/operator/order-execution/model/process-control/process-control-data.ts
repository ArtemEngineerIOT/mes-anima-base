import type { ProcessControlChecklistRow, ProcessControlFormState, ProcessControlInfoBlock } from "./types";

export const PROCESS_CONTROL_CHECKLIST_ROWS: ProcessControlChecklistRow[] = [
    { id: "metallic-ink-mixer", section: "Миксер на металлизированной краске включен" },
    { id: "mirror-and-lens-clean", section: "Чистота зеркала и линзы световода проверены" },
    { id: "cs-level-visual-check", section: "Визуальная проверка уровня CS в ёмкости" },
    { id: "electrostatic-bars-position", section: "Положение электростатических планок" },
    {
        id: "camera-parameters-target",
        section: "Параметры камеры контроля соответствуют целевым значениям (проверка на старте)",
    },
];

export const PROCESS_CONTROL_INITIAL_FORM: ProcessControlFormState = {
    replacedElementsCount: "3",
    pressWidth: "520",
    flags: {
        "metallic-ink-mixer": true,
        "mirror-and-lens-clean": false,
        "cs-level-visual-check": false,
        "electrostatic-bars-position": true,
        "camera-parameters-target": false,
    },
};

export const PROCESS_CONTROL_INFO_BLOCKS: ProcessControlInfoBlock[] = [
    {
        id: "periodicity",
        title: "Информация",
        description:
            "Производить контроль и фиксацию параметров на каждом СТАРТЕ (при настройке и после длительных остановок более 1,5 часа). Периодичность заполнения карты контроля параметров печати — каждые 2 часа, но не реже, чем 1 раз на проект.",
    },
    {
        id: "deviation",
        title: "Информация",
        description:
            "В случае отклонения от допусков остановить машину до устранения неисправности и выяснения причин. Сообщить начальнику смены. Работа с параметрами, выходящими за рамки допусков, согласуется с ответственными лицами (технолог, начальник смены) с подтверждением их подписи и обоснованием согласования в листе контроля технологических параметров.",
    },
];
