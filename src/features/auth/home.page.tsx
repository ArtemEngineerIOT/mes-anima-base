import { Navigate } from "react-router";

import { getDefaultHomeRoute } from "@/shared/model/default-home-route";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";

function HomePage() {
    const { session, isBootstrapLoading } = useSession();

    if (isBootstrapLoading) {
        return null;
    }

    if (!session) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    return <Navigate to={getDefaultHomeRoute(session.mesBootstrap)} replace />;
}

export const Component = HomePage;
