import { Navigate, Link } from "react-router";

import { getDefaultHomeRoute } from "@/shared/model/default-home-route";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";
import { Button } from "@/shared/ui/kit/button";

import { AuthLayout } from "./ui/auth-layout";
import { LoginForm } from "./ui/login-form";

function LoginPage() {
    const { session, isBootstrapLoading } = useSession();

    if (isBootstrapLoading) {
        return null;
    }

    if (session?.mesBootstrap) {
        return <Navigate to={getDefaultHomeRoute(session.mesBootstrap)} replace />;
    }

    return (
        <AuthLayout
            title="Вход в систему"
            description="Введите Ваш логин и пароль для входа в систему"
            form={<LoginForm />}
            footer={
                <>
                    Нет аккаунта?
                    <Button asChild variant={"link"}>
                        <Link className="underline text-primary" to={ROUTES.REGISTER}>
                            Зарегестрироваться
                        </Link>
                    </Button>
                </>
            }
        />
    );
}

export const Component = LoginPage;
