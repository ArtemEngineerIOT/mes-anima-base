import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import type { BlockReasonRow } from "./material-order-workspace-mock";
import { mapMaterialOrderBlockReasonsPayload } from "./map-material-order-block-reasons-payload";

export function useMaterialOrderBlockReasons() {
    const [blockReasons, setBlockReasons] = useState<BlockReasonRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: listBlockReasons } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.listBlockReasons,
        {},
    );
    const listBlockReasonsRef = useRef(listBlockReasons);
    listBlockReasonsRef.current = listBlockReasons;

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const payload = await listBlockReasonsRef.current({ body: [] });
            setBlockReasons(mapMaterialOrderBlockReasonsPayload(payload));
        } catch (loadError) {
            setBlockReasons([]);
            setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить причины блокировки");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    return {
        blockReasons,
        isLoading,
        error,
        reload: load,
    };
}
