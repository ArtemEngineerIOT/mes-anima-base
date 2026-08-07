import { useCallback } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import type { ApiSchemas } from "@/shared/api/schema";

/**
 * Запрос listUnprocessedSignals — таблица «Необработанные сигналы с машины».
 */
export function useListUnprocessedSignals() {
    const { mutateAsync: listUnprocessedSignals, isPending, error, reset } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.listUnprocessedSignals,
        {},
    );

    const listSignals = useCallback(
        async (workAreaId: string): Promise<ApiSchemas["OrderExecutionListUnprocessedSignalsResponse"]> => {
            const trimmedWorkAreaId = workAreaId.trim();
            if (!trimmedWorkAreaId) {
                throw new Error("Не удалось определить workAreaId этапа");
            }

            return listUnprocessedSignals({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });
        },
        [listUnprocessedSignals],
    );

    return {
        listSignals,
        isListSignalsPending: isPending,
        listSignalsError: error,
        resetListSignals: reset,
    };
}
