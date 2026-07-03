import type { Role } from "./roles";
import { ROUTES } from "./routes";

export type NavItem = {
    id: string;
    label: string;
    to: string;
    roles: readonly Role[] | "any";
};

export type NavGroup = {
    id: string;
    label: string;
    items: readonly NavItem[];
};

// Стартовый черновик меню под макет (можно расширять по мере добавления страниц).
export const NAVIGATION: readonly NavGroup[] = [
    {
        id: "tech",
        label: "Технологические параметры",
        items: [
            { id: "tech.print", label: "Печать", to: ROUTES.TECH.PRINT, roles: "any" },
            { id: "tech.lamination", label: "Ламинация", to: ROUTES.TECH.LAMINATION, roles: "any" },
            { id: "tech.rewind", label: "Перемотка", to: ROUTES.TECH.REWIND, roles: "any" },
            { id: "tech.cut", label: "Резка", to: ROUTES.TECH.CUT, roles: "any" },
            { id: "tech.bags", label: "Бэги", to: ROUTES.TECH.BAGS, roles: "any" },
            { id: "tech.spiders", label: "Паучи", to: ROUTES.TECH.SPIDERS, roles: "any" },
        ],
    },
    {
        id: "operator",
        label: "Оператор участка",
        items: [
            {
                id: "op.plan",
                label: "Производственный план",
                to: ROUTES.OPERATOR.PRODUCTION_PLAN,
                roles: ["operator", "manager"],
            },
            {
                id: "op.exec",
                label: "Исполнение заказа",
                to: ROUTES.OPERATOR.ORDER_EXECUTION,
                roles: ["operator", "manager"],
            },
            {
                id: "op.materialOrder",
                label: "Заказ материалов",
                to: ROUTES.OPERATOR.MATERIAL_ORDER,
                roles: ["operator", "manager"],
            },
            {
                id: "op.materialMove",
                label: "Перемещение материалов",
                to: ROUTES.OPERATOR.MATERIAL_MOVE,
                roles: ["operator", "manager"],
            },
            {
                id: "op.defectWeighing",
                label: "Взвешивание брака",
                to: ROUTES.OPERATOR.DEFECT_WEIGHING,
                roles: ["operator", "manager"],
            },
        ],
    },
    {
        id: "manager",
        label: "Руководитель",
        items: [
            {
                id: "mgr.oee",
                label: "OEE + Брак/дефект",
                to: ROUTES.MANAGER.OEE_DEFECT,
                roles: ["manager", "admin"],
            },
            {
                id: "mgr.ext",
                label: "Расширенный отчет",
                to: ROUTES.MANAGER.EXTENDED_REPORT,
                roles: ["manager", "admin"],
            },
            {
                id: "mgr.proc",
                label: "Выполнение по процессам",
                to: ROUTES.MANAGER.PROCESS_EXECUTION,
                roles: ["manager", "admin"],
            },
            {
                id: "mgr.retro",
                label: "Ретроспектива",
                to: ROUTES.MANAGER.RETROSPECTIVE,
                roles: ["manager", "admin"],
            },
        ],
    },
    {
        id: "admin",
        label: "Администратор",
        items: [
            { id: "adm.refs", label: "Справочники", to: ROUTES.ADMIN.REFERENCES, roles: ["admin"] },
            { id: "adm.users", label: "Пользователи", to: ROUTES.ADMIN.USERS, roles: ["admin"] },
            { id: "adm.eq", label: "Оборудование", to: ROUTES.ADMIN.EQUIPMENT, roles: ["admin"] },
            { id: "adm.alerts", label: "Оповещения", to: ROUTES.ADMIN.ALERTS, roles: ["admin"] },
        ],
    },
] as const;

