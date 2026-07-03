import "react-router-dom";

export const ROUTES = {
    HOME: "/",
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    TECH: {
        PRINT: "/tech/print",
        LAMINATION: "/tech/lamination",
        REWIND: "/tech/rewind",
        CUT: "/tech/cut",
        BAGS: "/tech/bags",
        SPIDERS: "/tech/spiders",
    },
    OPERATOR: {
        PRODUCTION_PLAN: "/operator/production-plan",
        ORDER_EXECUTION: "/operator/order-execution",
        MATERIAL_ORDER: "/operator/material-order",
        MATERIAL_MOVE: "/operator/material-move",
        DEFECT_WEIGHING: "/operator/defect-weighing",
    },
    MANAGER: {
        OEE_DEFECT: "/manager/oee-defect",
        EXTENDED_REPORT: "/manager/extended-report",
        PROCESS_EXECUTION: "/manager/process-execution",
        RETROSPECTIVE: "/manager/retrospective",
    },
    ADMIN: {
        REFERENCES: "/admin/references",
        USERS: "/admin/users",
        EQUIPMENT: "/admin/equipment",
        ALERTS: "/admin/alerts",
    },
};

declare module "react-router-dom" {
    interface Register {
        params: Record<string, string | undefined>;
    }
}
