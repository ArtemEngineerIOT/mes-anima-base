import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import {
    mapStageRollPresencePayload,
    MATERIALS_ROLL_PRESENCE_EMPTY_SNAPSHOT,
} from "./map-stage-roll-presence-payload";
import type { MaterialsPresenceRow } from "./types";

type UseMaterialsWriteoffRollPresenceOptions = {
    workAreaId?: string;
    enabled: boolean;
    refreshKey?: number;
};

export function useMaterialsWriteoffRollPresence({
    workAreaId,
    enabled,
    refreshKey = 0,
}: UseMaterialsWriteoffRollPresenceOptions) {
    const [rows, setRows] = useState<MaterialsPresenceRow[]>(MATERIALS_ROLL_PRESENCE_EMPTY_SNAPSHOT.rows);
    const [asOf, setAsOf] = useState<string | null>(MATERIALS_ROLL_PRESENCE_EMPTY_SNAPSHOT.asOf);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: fetchStageRollPresence } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getStageRollPresence,
        {},
    );

    const fetchStageRollPresenceRef = useRef(fetchStageRollPresence);
    fetchStageRollPresenceRef.current = fetchStageRollPresence;

    const load = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            setRows(MATERIALS_ROLL_PRESENCE_EMPTY_SNAPSHOT.rows);
            setAsOf(MATERIALS_ROLL_PRESENCE_EMPTY_SNAPSHOT.asOf);
            setError("Не удалось определить workAreaId этапа");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = await fetchStageRollPresenceRef.current({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });
            const snapshot = mapStageRollPresencePayload(payload);
            setRows(snapshot.rows);
            setAsOf(snapshot.asOf);
        } catch (loadError) {
            setRows(MATERIALS_ROLL_PRESENCE_EMPTY_SNAPSHOT.rows);
            setAsOf(MATERIALS_ROLL_PRESENCE_EMPTY_SNAPSHOT.asOf);
            setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить рулоны в машине");
        } finally {
            setIsLoading(false);
        }
    }, [workAreaId]);

    useEffect(() => {
        if (!enabled) {
            setRows(MATERIALS_ROLL_PRESENCE_EMPTY_SNAPSHOT.rows);
            setAsOf(MATERIALS_ROLL_PRESENCE_EMPTY_SNAPSHOT.asOf);
            setError(null);
            setIsLoading(false);
            return;
        }

        void load();
    }, [enabled, load, refreshKey]);

    return {
        rows,
        asOf,
        isLoading,
        error,
        reload: load,
    };
}
