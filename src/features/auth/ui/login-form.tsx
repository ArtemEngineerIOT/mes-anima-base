import { Button } from "@/shared/ui/kit/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/kit/form";
import { Input } from "@/shared/ui/kit/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../model/use-login";

const loginSchema = z.object({
    username: z.string().min(1, "Введите имя пользователя"),
    password: z.string().min(1, "Введите пароль").min(5, "Пароль должен содержать не менее 5 символов"),
});

export function LoginForm() {
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
        mode: "onChange",
    });

    const { errorMassage, isPending, login } = useLogin();

    const onSubmit = form.handleSubmit((data) => {
        console.log(data);
        login(data);
    });

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="admin" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input placeholder="***" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                {errorMassage && (
                    <p className="text-destructive text sm">{errorMassage}</p>
                )}

                <Button
                    type="submit"
                    disabled={isPending}
                >
                    Войти
                </Button>
            </form>
        </Form>
    );
}
