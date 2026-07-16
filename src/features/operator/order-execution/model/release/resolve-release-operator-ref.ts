import type { Session } from "@/shared/model/session";

export function resolveReleaseOperatorRef(session: Session | null | undefined, override?: string): string {
    const explicit = override?.trim();
    if (explicit) {
        return explicit;
    }

    return (
        session?.mesProfile?.employeeId?.trim() ||
        session?.mesProfile?.fio?.trim() ||
        session?.sub?.trim() ||
        ""
    );
}
