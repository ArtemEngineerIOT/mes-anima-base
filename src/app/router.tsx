import { createBrowserRouter } from "react-router";
import { App } from "./app";
import { ROUTES } from "@/shared/model/routes";
import { Providers } from "./providers";
import { ProtectedRoute } from "./protected-route";
import { RoleRoute } from "./role-route";

export const router = createBrowserRouter([
    {
        element: (
            <Providers>
                <App />
            </Providers>
        ),
        children: [
            {
                Component: ProtectedRoute,
                children: [
                    {
                        path: ROUTES.TECH.PRINT,
                        lazy: () => import("@/features/tech/print.page"),
                    },
                    {
                        path: ROUTES.TECH.LAMINATION,
                        lazy: () => import("@/features/tech/lamination.page"),
                    },
                    {
                        path: ROUTES.TECH.REWIND,
                        lazy: () => import("@/features/tech/rewind.page"),
                    },
                    {
                        path: ROUTES.TECH.CUT,
                        lazy: () => import("@/features/tech/cut.page"),
                    },
                    {
                        path: ROUTES.TECH.BAGS,
                        lazy: () => import("@/features/tech/bags.page"),
                    },
                    {
                        path: ROUTES.TECH.SPIDERS,
                        lazy: () => import("@/features/tech/spiders.page"),
                    },
                    // Оператор участка
                    {
                        Component: () => <RoleRoute roles={["operator", "manager"]} />,
                        children: [
                            {
                                path: ROUTES.OPERATOR.PRODUCTION_PLAN,
                                lazy: () => import("@/features/operator/production-plan.page"),
                            },
                            {
                                path: ROUTES.OPERATOR.ORDER_EXECUTION,
                                lazy: () => import("@/features/operator/order-execution.page"),
                            },
                            {
                                path: ROUTES.OPERATOR.ORDER_EXECUTION_MONITORING,
                                lazy: () => import("@/features/operator/order-execution-monitoring.page"),
                            },
                            {
                                path: ROUTES.OPERATOR.MATERIAL_ORDER,
                                lazy: () => import("@/features/operator/material-order.page"),
                            },
                            {
                                path: ROUTES.OPERATOR.MATERIAL_MOVE,
                                lazy: () => import("@/features/operator/material-move.page"),
                            },
                            {
                                path: ROUTES.OPERATOR.DEFECT_WEIGHING,
                                lazy: () => import("@/features/operator/defect-weighing.page"),
                            },
                        ],
                    },
                    // Руководитель
                    {
                        Component: () => <RoleRoute roles={["manager", "admin"]} />,
                        children: [
                            {
                                path: ROUTES.MANAGER.OEE_DEFECT,
                                lazy: () => import("@/features/manager/oee-defect.page"),
                            },
                            {
                                path: ROUTES.MANAGER.EXTENDED_REPORT,
                                lazy: () => import("@/features/manager/extended-report.page"),
                            },
                            {
                                path: ROUTES.MANAGER.PROCESS_EXECUTION,
                                lazy: () => import("@/features/manager/process-execution.page"),
                            },
                            {
                                path: ROUTES.MANAGER.RETROSPECTIVE,
                                lazy: () => import("@/features/manager/retrospective.page"),
                            },
                        ],
                    },
                    // Администратор
                    {
                        Component: () => <RoleRoute roles={["admin"]} />,
                        children: [
                            {
                                path: ROUTES.ADMIN.REFERENCES,
                                lazy: () => import("@/features/admin/references.page"),
                            },
                            {
                                path: ROUTES.ADMIN.USERS,
                                lazy: () => import("@/features/admin/users.page"),
                            },
                            {
                                path: ROUTES.ADMIN.EQUIPMENT,
                                lazy: () => import("@/features/admin/equipment.page"),
                            },
                            {
                                path: ROUTES.ADMIN.ALERTS,
                                lazy: () => import("@/features/admin/alerts.page"),
                            },
                        ],
                    },
                ],
            },
            {
                path: ROUTES.LOGIN,
                lazy: () => import("@/features/auth/login.page"),
            },
            {
                path: ROUTES.REGISTER,
                lazy: () => import("@/features/auth/register.page"),
            },
            {
                path: ROUTES.HOME,
                lazy: () => import("@/features/auth/home.page"),
            },
        ],
    },
]);
