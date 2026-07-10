import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import {
    mapStageRollRegistryPayload,
    MATERIALS_STAGE_REGISTRY_EMPTY_SNAPSHOT,
} from "./map-stage-roll-registry-payload";
import { mapPrintMaterialReturnLabelPayload } from "./map-print-material-return-label-payload";
import type { MaterialsStageRegistrySnapshot } from "./types";

type UseMaterialsWriteoffStageRegistryOptions = {
    workAreaId?: string;
    enabled: boolean;
    refreshKey?: number;
};

export function useMaterialsWriteoffStageRegistry({
    workAreaId,
    enabled,
    refreshKey = 0,
}: UseMaterialsWriteoffStageRegistryOptions) {
    const [snapshot, setSnapshot] = useState<MaterialsStageRegistrySnapshot>(MATERIALS_STAGE_REGISTRY_EMPTY_SNAPSHOT);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [printingMaterialRollId, setPrintingMaterialRollId] = useState<string | null>(null);
    const [printError, setPrintError] = useState<string | null>(null);

    const { mutateAsync: fetchStageRollRegistry } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getStageRollRegistry,
        {},
    );

    const { mutateAsync: printReturnLabelRequest } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.printOrderExecutionMaterialReturnLabel,
        {},
    );

    const fetchStageRollRegistryRef = useRef(fetchStageRollRegistry);
    fetchStageRollRegistryRef.current = fetchStageRollRegistry;

    const printReturnLabelRequestRef = useRef(printReturnLabelRequest);
    printReturnLabelRequestRef.current = printReturnLabelRequest;

    const load = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            setSnapshot(MATERIALS_STAGE_REGISTRY_EMPTY_SNAPSHOT);
            setError("Не удалось определить workAreaId этапа");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = await fetchStageRollRegistryRef.current({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });
            setSnapshot(mapStageRollRegistryPayload(payload));
        } catch (loadError) {
            setSnapshot(MATERIALS_STAGE_REGISTRY_EMPTY_SNAPSHOT);
            setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить данные");
        } finally {
            setIsLoading(false);
        }
    }, [workAreaId]);

    const printReturnLabel = useCallback(
        async (materialRollId: string) => {
            const trimmedWorkAreaId = workAreaId?.trim();
            const trimmedMaterialRollId = materialRollId.trim();

            if (!trimmedWorkAreaId) {
                setPrintError("Не удалось определить workAreaId этапа");
                return;
            }

            if (!trimmedMaterialRollId) {
                setPrintError("Не удалось определить material_roll_id рулона");
                return;
            }

            setPrintingMaterialRollId(trimmedMaterialRollId);
            setPrintError(null);

            try {
                const payload = await printReturnLabelRequestRef.current({
                    body: [{ workAreaId: trimmedWorkAreaId, materialRollId: trimmedMaterialRollId }],
                });
                const previewFilePath = mapPrintMaterialReturnLabelPayload(payload);
                window.open(previewFilePath, "_blank", "noopener,noreferrer");
            } catch (printLabelError) {
                setPrintError(
                    printLabelError instanceof Error ? printLabelError.message : "Не удалось напечатать этикетку",
                );
            } finally {
                setPrintingMaterialRollId(null);
            }
        },
        [workAreaId],
    );

    useEffect(() => {
        if (!enabled) {
            setSnapshot(MATERIALS_STAGE_REGISTRY_EMPTY_SNAPSHOT);
            setError(null);
            setPrintError(null);
            setIsLoading(false);
            return;
        }

        void load();
    }, [enabled, load, refreshKey]);

    return {
        stageOperations: snapshot.rows,
        asOf: snapshot.asOf,
        isLoading,
        error,
        printError,
        printingMaterialRollId,
        printReturnLabel,
        reload: load,
    };
}
