import type { ProcessControlChecklistRow, ProcessControlInfoBlock } from "./types";

export const PROCESS_CONTROL_CHECKLIST_ROWS: ProcessControlChecklistRow[] = [
    { id: "MIXER_METALLIC", section: "Миксер на металлизированной краске включен" },
    { id: "LIGHTGUIDE_CLEAN", section: "Чистота зеркала и линзы световода проверены" },
    { id: "CS_LEVEL", section: "Визуальная проверка уровня CS в ёмкости" },
    { id: "ES_BARS", section: "Положение электростатических планок" },
    {
        id: "CAMERA_PARAMS",
        section: "Параметры камеры контроля соответствуют целевым значениям (проверка на старте)",
    },
    { id: "DRAUGHT_GAUGES", section: "Тягонапоромеры", hasValue: true },
];

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
