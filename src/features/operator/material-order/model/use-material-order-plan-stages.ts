import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { MATERIAL_ORDER_RESOURCE_CODE } from "./constants";
import { mapMaterialOrderPlanStagesPayload } from "./map-material-order-plan-stages-payload";
import type { MaterialOrderPlanStage } from "./types";

export function useMaterialOrderPlanStages(
    resourceCode: string = MATERIAL_ORDER_RESOURCE_CODE,
    enabled: boolean = true,
) {
    const [stages, setStages] = useState<MaterialOrderPlanStage[]>([]);
    const [resolvedResourceCode, setResolvedResourceCode] = useState(resourceCode);
    const [isLoading, setIsLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: fetchPlanStages } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getMaterialOrderPlanStages,
        {},
    );

    const fetchPlanStagesRef = useRef(fetchPlanStages);
    fetchPlanStagesRef.current = fetchPlanStages;

    const load = useCallback(async () => {
        if (!enabled) {
            return;
        }

        const trimmedResourceCode = resourceCode.trim();
        if (!trimmedResourceCode) {
            setStages([]);
            setError("Не удалось определить resourceCode машины");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = await fetchPlanStagesRef.current({
                body: [{ resourceCode: trimmedResourceCode }],
            });
            const mapped = mapMaterialOrderPlanStagesPayload(payload, trimmedResourceCode);
            setStages(mapped.stages);
            setResolvedResourceCode(mapped.resourceCode);
        } catch (loadError) {
            setStages([]);
            setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить этапы");
        } finally {
            setIsLoading(false);
        }
    }, [resourceCode, enabled]);

    useEffect(() => {
        if (!enabled) {
            setStages([]);
            setError(null);
            setIsLoading(false);
            setResolvedResourceCode(resourceCode);
            return;
        }

        void load();
    }, [enabled, load, resourceCode]);

    return {
        stages,
        resourceCode: resolvedResourceCode,
        isLoading,
        error,
        reload: load,
    };
}
