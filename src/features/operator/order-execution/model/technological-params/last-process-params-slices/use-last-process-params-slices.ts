import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import type { TechnologicalParamHistoryEntry } from "../../technological-params-history";
import type { TechnologicalParamsSections } from "../../technological-params-mock";
import { mapLastProcessParamsSlicesPayload } from "./map-last-process-params-slices-payload";

type UseLastProcessParamsSlicesOptions = {
    workAreaId?: string;
    sections: TechnologicalParamsSections;
    enabled?: boolean;
};

export function useLastProcessParamsSlices({
    workAreaId,
    sections,
    enabled = true,
}: UseLastProcessParamsSlicesOptions) {
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
    const sectionsRef = useRef(sections);
    sectionsRef.current = sections;

    const resetState = useCallback(() => {
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
            const mapped = mapLastProcessParamsSlicesPayload(payload, sectionsRef.current);
            setHistoryByRowId(mapped.historyByRowId);
        } catch (loadError) {
            resetState();
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Не удалось загрузить срезы технологических параметров",
            );
        } finally {
            setIsLoading(false);
        }
    }, [resetState, workAreaId]);

    useEffect(() => {
        if (!enabled) {
            resetState();
            setIsLoading(false);
            return;
        }

        void load();
    }, [enabled, load, resetState]);

    return {
        historyByRowId,
        isLoading,
        error,
        reload: load,
    };
}
