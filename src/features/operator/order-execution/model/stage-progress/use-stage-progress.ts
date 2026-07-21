import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import { mapStageProgressPayload, toStageProgressInfoItems } from "./map-stage-progress-payload";
import { STAGE_PROGRESS_EMPTY, type StageProgress, type StageProgressInfoItem } from "./types";

type LoadOptions = {
    silent?: boolean;
};

type UseStageProgressOptions = {
    workAreaId?: string;
    enabled?: boolean;
};

export function useStageProgress({ workAreaId, enabled = true }: UseStageProgressOptions) {
    const [progress, setProgress] = useState<StageProgress>(STAGE_PROGRESS_EMPTY);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: fetchProgress } = rqClient.useMutation("post", REST_FUNCTION_PATHS.getProgress, {});

    const fetchProgressRef = useRef(fetchProgress);
    fetchProgressRef.current = fetchProgress;

    const resetState = useCallback(() => {
        setProgress(STAGE_PROGRESS_EMPTY);
        setError(null);
    }, []);

    const load = useCallback(
        async (options?: LoadOptions) => {
            const silent = options?.silent ?? false;
            const trimmedWorkAreaId = workAreaId?.trim();
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
                const payload = await fetchProgressRef.current({
                    body: [{ workAreaId: trimmedWorkAreaId }],
                });
                setProgress(mapStageProgressPayload(payload));
                if (silent) {
                    setError(null);
                }
            } catch (loadError) {
                if (!silent) {
                    resetState();
                }
                setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить прогресс этапа");
            } finally {
                if (!silent) {
                    setIsLoading(false);
                }
            }
        },
        [resetState, workAreaId],
    );

    useEffect(() => {
        if (!enabled) {
            resetState();
            setIsLoading(false);
            return;
        }

        void load();
    }, [enabled, load, resetState]);

    const progressInfo: StageProgressInfoItem[] | null = useMemo(() => {
        if (!enabled || !workAreaId?.trim()) {
            return null;
        }
        const isInitialLoading =
            isLoading &&
            progress.requiredMeterageM == null &&
            progress.releasedGoodMeterageM == null &&
            progress.remainingMeterageM == null &&
            progress.progressPercent == null;
        return toStageProgressInfoItems(progress, { loading: isInitialLoading });
    }, [enabled, isLoading, progress, workAreaId]);

    return {
        progress,
        progressInfo,
        isLoading,
        error,
        reload: load,
    };
}
