import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { useSyncLoadingOnEnable } from "../use-loading-on-enable";
import { mapReleaseBlockReasonsPayload } from "./map-release-block-reasons-payload";
import type { ReleaseBlockReason } from "./types";

type UseReleaseBlockReasonsOptions = {
    enabled?: boolean;
};

export function useReleaseBlockReasons({ enabled = true }: UseReleaseBlockReasonsOptions = {}) {
    const [blockReasons, setBlockReasons] = useState<ReleaseBlockReason[]>([]);
    const [isLoading, setIsLoading] = useState(enabled);
    useSyncLoadingOnEnable(enabled, setIsLoading);
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
            setBlockReasons(mapReleaseBlockReasonsPayload(payload));
        } catch (loadError) {
            setBlockReasons([]);
            setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить причины блокировки");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        void load();
    }, [enabled, load]);

    return {
        blockReasons,
        isLoading,
        error,
        reload: load,
    };
}
