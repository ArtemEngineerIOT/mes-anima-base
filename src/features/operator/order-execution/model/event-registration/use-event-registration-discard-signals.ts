import { useCallback } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import type { ApiSchemas } from "@/shared/api/schema";

import { buildEventRegistrationDiscardSignalsBody } from "./build-event-registration-discard-signals-body";

export type EventRegistrationDiscardSignalsParams = {
    workAreaId: string;
    signalIds: string[];
    comment: string;
};

/**
 * Запрос discardSignals (SCR-07 M3): удаление необработанных сигналов машины.
 * Маппинг ответа — отдельным шагом.
 */
export function useEventRegistrationDiscardSignals() {
    const { mutateAsync: discardProductionEventSignals, isPending, error, reset } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.discardProductionEventSignals,
        {},
    );

    const discardSignals = useCallback(
        async (
            params: EventRegistrationDiscardSignalsParams,
        ): Promise<ApiSchemas["OrderExecutionProductionEventWizardDiscardSignalsResponse"]> => {
            const workAreaId = params.workAreaId.trim();
            if (!workAreaId) {
                throw new Error("Не удалось определить workAreaId этапа");
            }

            const signalIds = params.signalIds.map((id) => id.trim()).filter(Boolean);
            if (signalIds.length === 0) {
                throw new Error("Выберите хотя бы один сигнал для удаления");
            }

            const comment = params.comment.trim();
            if (!comment) {
                throw new Error("Укажите комментарий для удаления сигналов");
            }

            return discardProductionEventSignals({
                body: buildEventRegistrationDiscardSignalsBody({
                    workAreaId,
                    signalIds,
                    comment,
                }),
            });
        },
        [discardProductionEventSignals],
    );

    return {
        discardSignals,
        isDiscardSignalsPending: isPending,
        discardSignalsError: error,
        resetDiscardSignals: reset,
    };
}
