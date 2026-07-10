import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { buildListReturnWarehousesBody } from "./build-list-return-warehouses-body";
import { mapListReturnWarehousesPayload } from "./map-list-return-warehouses-payload";
import type { MaterialsReturnWarehouseOption } from "./types";

type UseMaterialsWriteoffReturnWarehousesOptions = {
    workAreaId?: string;
    operatorRef: string;
    enabled: boolean;
};

export function useMaterialsWriteoffReturnWarehouses({
    workAreaId,
    operatorRef,
    enabled,
}: UseMaterialsWriteoffReturnWarehousesOptions) {
    const [warehouseOptions, setWarehouseOptions] = useState<MaterialsReturnWarehouseOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: fetchReturnWarehouses } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.listReturnWarehouses,
        {},
    );

    const fetchReturnWarehousesRef = useRef(fetchReturnWarehouses);
    fetchReturnWarehousesRef.current = fetchReturnWarehouses;

    const load = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        const trimmedOperatorRef = operatorRef.trim();

        if (!trimmedWorkAreaId) {
            setWarehouseOptions([]);
            setError("Не удалось определить workAreaId этапа");
            return;
        }

        if (!trimmedOperatorRef) {
            setWarehouseOptions([]);
            setError("Не удалось определить оператора");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = await fetchReturnWarehousesRef.current({
                body: buildListReturnWarehousesBody({
                    workAreaId: trimmedWorkAreaId,
                    operatorRef: trimmedOperatorRef,
                }),
            });
            setWarehouseOptions(mapListReturnWarehousesPayload(payload));
        } catch (loadError) {
            setWarehouseOptions([]);
            setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить склады");
        } finally {
            setIsLoading(false);
        }
    }, [operatorRef, workAreaId]);

    useEffect(() => {
        if (!enabled) {
            setWarehouseOptions([]);
            setError(null);
            setIsLoading(false);
            return;
        }

        void load();
    }, [enabled, load]);

    return {
        warehouseOptions,
        isLoading,
        error,
        reload: load,
    };
}
