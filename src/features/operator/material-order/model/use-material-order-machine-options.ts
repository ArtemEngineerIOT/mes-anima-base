import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { mapProductionPlanMachinesPayload } from "@/features/operator/production-plan/model/map-production-plan-machines-payload";
import type { ProductionPlanMachine } from "@/features/operator/production-plan/model/types";

export function useMaterialOrderMachineOptions() {
    const [machineOptions, setMachineOptions] = useState<ProductionPlanMachine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: fetchProductionPlanMachines } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getProductionPlanMachines,
        {},
    );
    const fetchProductionPlanMachinesRef = useRef(fetchProductionPlanMachines);
    fetchProductionPlanMachinesRef.current = fetchProductionPlanMachines;

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const payload = await fetchProductionPlanMachinesRef.current({ body: [] });
            setMachineOptions(mapProductionPlanMachinesPayload(payload));
        } catch (loadError) {
            setMachineOptions([]);
            setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить машины");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    return {
        machineOptions,
        isLoading,
        error,
        reload: load,
    };
}
