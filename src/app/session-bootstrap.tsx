import { useEffect } from "react";

import { useSession } from "@/shared/model/session";

/** Гидратация bootstrap MES с бэка после F5. */
export function SessionBootstrap() {
    const { token, mesBootstrap } = useSession();

    useEffect(() => {
        if (!token || mesBootstrap !== undefined) {
            return;
        }

        void useSession.getState().refreshBootstrap();
    }, [token, mesBootstrap]);

    return null;
}
