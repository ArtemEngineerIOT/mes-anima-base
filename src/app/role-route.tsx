import { getDefaultHomeRoute } from "@/shared/model/default-home-route";
import type { Role } from "@/shared/model/roles";
import { hasRoleAccess, normalizeRole } from "@/shared/model/roles";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";
import { Navigate, Outlet } from "react-router";

export function RoleRoute({ roles }: { roles: readonly Role[] | "any" }) {
    const { session, isBootstrapLoading } = useSession();

    if (isBootstrapLoading) {
        return null;
    }

    if (!session) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    const userRole = normalizeRole(session.role);

    if (!userRole) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    if (!hasRoleAccess(userRole, roles)) {
        return <Navigate to={getDefaultHomeRoute(session.mesBootstrap)} replace />;
    }

    return <Outlet />;
}
