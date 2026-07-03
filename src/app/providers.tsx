import { SessionBootstrap } from "@/app/session-bootstrap";
import { queryClient } from "@/shared/api/query-client";
import { ThemeProvider } from "@/shared/lib/theme";
import { SystemNotificationsProvider } from "@/shared/model/system-notifications";
import { QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <SystemNotificationsProvider>
                    <SessionBootstrap />
                    {children}
                </SystemNotificationsProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
