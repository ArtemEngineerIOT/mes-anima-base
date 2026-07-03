import type { MesBootstrap } from "@/shared/lib/mes-user-profile";

import { ROUTES } from "./routes";

const OPERATOR_APP_ROLE = "OPERATOR";

export function hasOperatorAppRole(mesBootstrap: MesBootstrap | undefined): boolean {
    return (
        mesBootstrap?.access.appRoleCodes.some(
            (code) => code.trim().toUpperCase() === OPERATOR_APP_ROLE,
        ) ?? false
    );
}

/** Стартовая страница после входа / перехода на `/` с учётом `mesUserProfile`. */
export function getDefaultHomeRoute(mesBootstrap: MesBootstrap | undefined): string {
    return hasOperatorAppRole(mesBootstrap) ? ROUTES.OPERATOR.PRODUCTION_PLAN : ROUTES.TECH.PRINT;
}
