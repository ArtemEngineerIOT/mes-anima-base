import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import type { TechnologicalParamHistoryEntry } from "../../technological-params-history";
import type { TechnologicalParamsSections } from "../../technological-params-mock";
import type { MachineId } from "../../types";
import { mapLastProcessParamsSlicesPayload } from "./map-last-process-params-slices-payload";

type UseLastProcessParamsSlicesOptions = {
    machineId: MachineId;
    workAreaId?: string;
    enabled?: boolean;
};

export function useLastProcessParamsSlices({
    machineId,
    workAreaId,
    enabled = true,
}: UseLastProcessParamsSlicesOptions) {
    const [sections, setSections] = useState<TechnologicalParamsSections | null>(null);
    const [historyByRowId, setHistoryByRowId] = useState<Record<string, TechnologicalParamHistoryEntry[]>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: fetchSlices } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getLastProcessParamsSlices,
        {},
    );

    const fetchSlicesRef = useRef(fetchSlices);
    fetchSlicesRef.current = fetchSlices;

    const resetState = useCallback(() => {
        setSections(null);
        setHistoryByRowId({});
        setError(null);
    }, []);

    const load = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            resetState();
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = await fetchSlicesRef.current({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });
            const mapped = mapLastProcessParamsSlicesPayload(payload, machineId);
            setSections(mapped.sections);
            setHistoryByRowId(mapped.historyByRowId);
        } catch (loadError) {
            resetState();
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Не удалось загрузить технологические параметры",
            );
        } finally {
            setIsLoading(false);
        }
    }, [machineId, resetState, workAreaId]);

    const dismissError = useCallback(() => setError(null), []);

    useEffect(() => {
        if (!enabled) {
            resetState();
            setIsLoading(false);
            return;
        }

        void load();
    }, [enabled, load, resetState]);

    return {
        sections,
        historyByRowId,
        isLoading,
        error,
        dismissError,
        reload: load,
    };
}
