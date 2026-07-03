import { HttpResponse } from "msw";

import { http } from "../http";
import type { ApiSchemas } from "../../schema";
import { verifyTokenOrThrow } from "../session";

const rightsSuccess = {
    rights_load_outcome: "SUCCESS",
    rights_load_code: "",
    rights_load_message: "",
} as const;

const profileByLogin: Record<string, ApiSchemas["MesUserProfileResponse"]> = {
    admin: [
        {
            outcome: "SUCCESS",
            code: "",
            message: "Профиль MES загружен",
            user_account_id: "1",
            employee_id: "1",
            fio: "Администратор Системы",
            position: "Администратор",
            position_code: "ADMIN",
            app_role_codes: "ADMIN",
            allowed_resource_codes: "",
            ...rightsSuccess,
        },
    ],
    operator: [
        {
            outcome: "SUCCESS",
            code: "",
            message: "Профиль MES загружен",
            user_account_id: "2",
            employee_id: "2",
            fio: "Иванов Иван Иванович",
            position: "Оператор",
            position_code: "OPERATOR",
            app_role_codes: "OPERATOR",
            allowed_resource_codes: "PR120,PR110",
            ...rightsSuccess,
        },
    ],
    manager: [
        {
            outcome: "SUCCESS",
            code: "",
            message: "Профиль MES загружен",
            user_account_id: "4",
            employee_id: "4",
            fio: "Петров Петр Петрович",
            position: "Руководитель",
            position_code: "MANAGER",
            app_role_codes: "MANAGER",
            allowed_resource_codes: "",
            ...rightsSuccess,
        },
    ],
    viewer: [
        {
            outcome: "SUCCESS",
            code: "",
            message: "Профиль MES загружен",
            user_account_id: "3",
            employee_id: "3",
            fio: "Кузнецов Виктор Сидорович",
            position: "Оператор",
            position_code: "OPERATOR",
            app_role_codes: "",
            allowed_resource_codes: "PR120",
            ...rightsSuccess,
        },
    ],
};

export const mesUserProfileFunctionHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/mesUserProfile", async ({ request }) => {
        await verifyTokenOrThrow(request);
        const body = (await request.json().catch(() => [])) as ApiSchemas["MesUserProfileRequest"];
        const login = body[0]?.login?.trim();
        const payload: ApiSchemas["MesUserProfileResponse"] =
            (login ? profileByLogin[login] : undefined) ?? profileByLogin.operator!;
        return HttpResponse.json(payload);
    }),
];
