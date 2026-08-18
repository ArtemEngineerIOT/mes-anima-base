import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useJobDocumentationFrontProcessParamsSliceCreatedSubscription } from "@/shared/api/websocket";

import type { TechnologicalParamHistoryEntry } from "../../technological-params-history";
import type { TechnologicalParamsSections } from "../../technological-params-mock";
import type { MachineId } from "../../types";
import {
    mapLastProcessParamsSlicesHistory,
    mapLastProcessParamsSlicesPayload,
} from "./map-last-process-params-slices-payload";
import { readProcessParamsSliceCreatedWorkAreaId } from "./read-process-params-slice-created-work-area-id";

type LoadSlicesOptions = {
    silent?: boolean;
    slicesOnly?: boolean;
};

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
    const [errorKey, setErrorKey] = useState(0);
    const errorKeyRef = useRef(0);

    const { mutateAsync: fetchSlices } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getLastProcessParamsSlices,
        {},
    );

    const fetchSlicesRef = useRef(fetchSlices);
    fetchSlicesRef.current = fetchSlices;
    const machineIdRef = useRef(machineId);
    machineIdRef.current = machineId;
    const workAreaIdRef = useRef(workAreaId);
    workAreaIdRef.current = workAreaId;
    const sectionsRef = useRef(sections);
    sectionsRef.current = sections;
    const loadGenerationRef = useRef(0);

    const resetState = useCallback(() => {
        setSections(null);
        setHistoryByRowId({});
        setError(null);
    }, []);

    const load = useCallback(async (options?: LoadSlicesOptions) => {
        const trimmedWorkAreaId = workAreaIdRef.current?.trim();
        const silent = options?.silent ?? false;
        const slicesOnly = options?.slicesOnly ?? false;
        const generation = ++loadGenerationRef.current;

        if (!trimmedWorkAreaId) {
            resetState();
            setIsLoading(false);
            return;
        }

        if (!silent) {
            setIsLoading(true);
            setError(null);
        }

        try {
            const payload = await fetchSlicesRef.current({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });

            if (generation !== loadGenerationRef.current) {
                return;
            }

            const currentSections = sectionsRef.current;
            if (slicesOnly && currentSections) {
                setHistoryByRowId(mapLastProcessParamsSlicesHistory(payload, currentSections));
                if (silent) {
                    setError(null);
                }
                return;
            }

            const mapped = mapLastProcessParamsSlicesPayload(payload, machineIdRef.current);
            setSections(mapped.sections);
            setHistoryByRowId(mapped.historyByRowId);
            if (silent) {
                setError(null);
            }
        } catch (loadError) {
            if (generation !== loadGenerationRef.current) {
                return;
            }

            const message =
                loadError instanceof Error
                    ? loadError.message
                    : "Не удалось загрузить технологические параметры";

            if (!silent) {
                resetState();
            }

            errorKeyRef.current += 1;
            setErrorKey(errorKeyRef.current);
            setError(message);
        } finally {
            if (!silent && generation === loadGenerationRef.current) {
                setIsLoading(false);
            }
        }
    }, [resetState]);

    const dismissError = useCallback(() => setError(null), []);

    useEffect(() => {
        if (!enabled) {
            resetState();
            setIsLoading(false);
            return;
        }

        void load();
    }, [enabled, load, machineId, resetState, workAreaId]);

    useJobDocumentationFrontProcessParamsSliceCreatedSubscription({
        enabled: enabled && Boolean(workAreaId?.trim()),
        onEvent: (payload) => {
            const currentWorkAreaId = workAreaIdRef.current?.trim();
            const eventWorkAreaId = readProcessParamsSliceCreatedWorkAreaId(payload);

            if (eventWorkAreaId && currentWorkAreaId && eventWorkAreaId !== currentWorkAreaId) {
                return;
            }

            void load({ silent: true, slicesOnly: true });
        },
    });

    return {
        sections,
        historyByRowId,
        isLoading,
        error,
        errorKey,
        dismissError,
        reload: load,
    };
}
