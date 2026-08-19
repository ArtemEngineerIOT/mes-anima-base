import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { useSyncLoadingOnEnable } from "../use-loading-on-enable";
import type { MachineId, OperatorJbPanel } from "../types";
import { mapJbTablePayload } from "./map-jb-table-payload";

type UseJbTableOptions = {
    machineId: MachineId;
    enabled?: boolean;
};

const emptyJbPanel: OperatorJbPanel = {
    groups: [],
};

export function useJbTable({ machineId, enabled = true }: UseJbTableOptions) {
    const [panel, setPanel] = useState<OperatorJbPanel>(emptyJbPanel);
    const [isLoading, setIsLoading] = useState(enabled);
    useSyncLoadingOnEnable(enabled, setIsLoading);
    const [error, setError] = useState<string | null>(null);
    const [errorKey, setErrorKey] = useState(0);
    const errorKeyRef = useRef(0);

    const { mutateAsync: fetchJbTable } = rqClient.useMutation("post", REST_FUNCTION_PATHS.getJbTable, {});

    const fetchJbTableRef = useRef(fetchJbTable);
    fetchJbTableRef.current = fetchJbTable;
    const machineIdRef = useRef(machineId);
    machineIdRef.current = machineId;
    const loadGenerationRef = useRef(0);

    const resetState = useCallback(() => {
        setPanel(emptyJbPanel);
        setError(null);
    }, []);

    const load = useCallback(async () => {
        const trimmedMachineId = machineIdRef.current?.trim();
        const generation = ++loadGenerationRef.current;

        if (!trimmedMachineId) {
            resetState();
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = await fetchJbTableRef.current({
                body: [{ machineId: trimmedMachineId }],
            });

            if (generation !== loadGenerationRef.current) {
                return;
            }

            setPanel(mapJbTablePayload(payload));
        } catch (loadError) {
            if (generation !== loadGenerationRef.current) {
                return;
            }

            resetState();
            errorKeyRef.current += 1;
            setErrorKey(errorKeyRef.current);
            setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить таблицу JB");
        } finally {
            if (generation === loadGenerationRef.current) {
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
    }, [enabled, load, machineId, resetState]);

    return {
        panel,
        isLoading,
        error,
        errorKey,
        dismissError,
        reload: load,
    };
}
