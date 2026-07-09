import { createContext, useContext, type ReactNode } from "react";

import type { MachineId } from "../../model/types";
import { useEventRegistration } from "../../model/event-registration/use-event-registration";

type EventRegistrationContextValue = ReturnType<typeof useEventRegistration>;

const EventRegistrationContext = createContext<EventRegistrationContextValue | null>(null);

export function EventRegistrationProvider({
    machineId,
    workAreaId,
    enabled,
    journalEnabled,
    children,
}: {
    machineId: MachineId;
    workAreaId?: string;
    enabled: boolean;
    journalEnabled: boolean;
    children: ReactNode;
}) {
    const value = useEventRegistration({ machineId, workAreaId, enabled, journalEnabled });
    return <EventRegistrationContext.Provider value={value}>{children}</EventRegistrationContext.Provider>;
}

export function useEventRegistrationContext(): EventRegistrationContextValue {
    const ctx = useContext(EventRegistrationContext);
    if (!ctx) {
        throw new Error("useEventRegistrationContext must be used within EventRegistrationProvider");
    }
    return ctx;
}
