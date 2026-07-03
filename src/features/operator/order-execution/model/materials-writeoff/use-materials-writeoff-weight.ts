import { useCallback, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { parseWriteoffLength } from "./materials-writeoff-form";
import { mapMaterialsWriteoffWeightPayload } from "./map-materials-writeoff-weight-payload";

type UseMaterialsWriteoffWeightOptions = {
    workAreaId?: string;
};

export function useMaterialsWriteoffWeight({ workAreaId }: UseMaterialsWriteoffWeightOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: fetchWriteoffWeight } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getOrderExecutionMaterialWriteoffWeight,
        {},
    );

    const fetchWriteoffWeightRef = useRef(fetchWriteoffWeight);
    fetchWriteoffWeightRef.current = fetchWriteoffWeight;

    const reset = useCallback(() => {
        setError(null);
        setIsLoading(false);
    }, []);

    const calculate = useCallback(
        async (lengthValue: string): Promise<string | null> => {
            const trimmedWorkAreaId = workAreaId?.trim();
            const parsedLength = parseWriteoffLength(lengthValue);

            if (!trimmedWorkAreaId) {
                setError("Не удалось определить workAreaId этапа");
                return null;
            }

            if (parsedLength === null) {
                setError("Укажите метраж больше 0");
                return null;
            }

            setIsLoading(true);
            setError(null);

            try {
                const payload = await fetchWriteoffWeightRef.current({
                    body: [{ length: parsedLength, workAreaId: trimmedWorkAreaId }],
                });
                const mapped = mapMaterialsWriteoffWeightPayload(payload);
                setError(mapped.warningMessage ?? null);
                return mapped.weight;
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : "Не удалось рассчитать вес");
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [workAreaId],
    );

    return {
        calculate,
        reset,
        isLoading,
        error,
    };
}
