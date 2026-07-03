import { delay, HttpResponse } from "msw";
import { http } from "../http";
import type { ApiSchemas } from "../../schema";
import { createRefreshTokenCookie, generateTokens } from "../session";

// Моковые пользователи
const mockUsers: ApiSchemas["User"][] = [
    {
        username: "admin",
        password: "admin123",
    },
    {
        username: "operator",
        password: "operator123",
    },
    {
        username: "viewer",
        password: "viewer123",
    },
];

// Моковые ошибки
const mockErrors = {
    unauthorized: {
        code: "UNAUTHORIZED",
        message: "Неверные учетные данные",
        token: "",
    } as ApiSchemas["UnauthorizedError"],

    badRequest: {
        error: "Bad Request",
        message: "Неверный формат запроса",
        path: "/auth",
        status: 400,
        timestamp: new Date().toISOString(),
    } as ApiSchemas["Error"],
};

export const authHandlers = [
    // Обработчик для логина
    http.post("/auth", async ({ request }) => {
        const body = (await request.json()) as ApiSchemas["User"];

        // Ищем пользователя
        const user = mockUsers.find((u) => u.username === body.username && u.password === body.password);

        await delay(500);

        if (!user) {
            return HttpResponse.json(mockErrors.unauthorized, { status: 401 });
        }

        // Успешный ответ
        // const successResponse: ApiSchemas["LoginResponse"] = {
        //     code: "A",
        //     message: "OK",
        //     token: userTokens.get(user.username)!,
        // };

        const { accessToken, refreshToken } = await generateTokens({
            userId: user.username,
            username: user.username,
        })

        return HttpResponse.json(
            {
                token: accessToken,
            },
            {
                status: 200,
                headers: {
                    "Set-Cookie": createRefreshTokenCookie(refreshToken),
                }
            },
        );
    }),

    // refresh endpoint removed (backend does not support it)
];
