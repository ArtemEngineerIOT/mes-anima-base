import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/kit/card";

export function AuthLayout({
    form,
    title,
    description,
    footer,
}: {
    form: React.ReactNode;
    title: React.ReactNode;
    description: React.ReactNode;
    footer: React.ReactNode;
}) {
    return (
        <main className="grow flex flex-col pt-[200px] items-center">
            <Card className="w-full max-w-[400px]">
                <CardHeader>
                    <CardTitle className="text-center text-xl font-semibold tracking-tight text-foreground">
                        {title}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>{form}</CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground [&_a]:underline [&_a]:text-primary">{footer}</p>
                </CardFooter>
            </Card>
        </main>
    );
}
