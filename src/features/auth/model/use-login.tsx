import { useState } from "react";
import { useNavigate } from "react-router";

import { publicRqClient } from "@/shared/api/instance";
import { getDefaultHomeRoute } from "@/shared/model/default-home-route";
import { SessionRoleError, useSession } from "@/shared/model/session";

export function useLogin() {
    const navigate = useNavigate();
    const session = useSession();
    const [sessionError, setSessionError] = useState<string | undefined>();
    const [isResolvingRole, setIsResolvingRole] = useState(false);

    const loginMutation = publicRqClient.useMutation("post", "/auth");

    const login = async (data: { username: string; password: string }) => {
        setSessionError(undefined);
        try {
            const auth = await loginMutation.mutateAsync({ body: data });
            if (!auth.token) {
                setSessionError("Токен не получен");
                return;
            }

            setIsResolvingRole(true);
            const bootstrap = await session.login(auth.token);
            navigate(getDefaultHomeRoute(bootstrap), { replace: true });
        } catch (error) {
            if (error instanceof SessionRoleError) {
                setSessionError(error.message);
                return;
            }
            setSessionError(error instanceof Error ? error.message : "Не удалось войти");
        } finally {
            setIsResolvingRole(false);
        }
    };

    const errorMassage =
        sessionError ?? (loginMutation.isError ? loginMutation.error?.message : undefined);

    return {
        login,
        isPending: loginMutation.isPending || isResolvingRole,
        errorMassage,
    };
}
