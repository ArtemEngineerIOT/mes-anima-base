import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Link } from "react-router";
import { AuthLayout } from "./ui/auth-layout";

function RegisterPage() {
    return (
        <AuthLayout
            title="Регистрация в системе"
            description="Введите Ваш логин и пароль для регистрации в системе"
            form={<form></form>}
            footer={
                <>
                    Уже есть аккаунт?
                    <Button asChild variant={"link"}>
                        <Link className="underline text-primary" to={ROUTES.LOGIN}>
                            Войти
                        </Link>
                    </Button>
                </>
            }
        />
    );
}

export const Component = RegisterPage;
