import { useCallback } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import type { ApiSchemas } from "@/shared/api/schema";

import { buildEventRegistrationProcessJournalBody } from "./build-event-registration-process-journal-body";

export type EventRegistrationProcessJournalParams = {
    workAreaId: string;
};

/**
 * Запрос getProcessJournal (SCR-07 M8): журнал процесса этапа.
 * Маппинг ответа — отдельным шагом.
 */
export function useEventRegistrationProcessJournal() {
    const { mutateAsync: getProductionEventProcessJournal, isPending, error, reset } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getProductionEventProcessJournal,
        {},
    );

    const loadProcessJournal = useCallback(
        async (
            params: EventRegistrationProcessJournalParams,
        ): Promise<ApiSchemas["OrderExecutionProductionEventProcessJournalResponse"]> => {
            const workAreaId = params.workAreaId.trim();
            if (!workAreaId) {
                throw new Error("Не удалось определить workAreaId этапа");
            }

            return getProductionEventProcessJournal({
                body: buildEventRegistrationProcessJournalBody({ workAreaId }),
            });
        },
        [getProductionEventProcessJournal],
    );

    return {
        loadProcessJournal,
        isProcessJournalPending: isPending,
        processJournalError: error,
        resetProcessJournal: reset,
    };
}
