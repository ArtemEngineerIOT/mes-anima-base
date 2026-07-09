import { useCallback } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import type { ApiSchemas } from "@/shared/api/schema";
import { useSession } from "@/shared/model/session";

import { buildEventRegistrationRegisterEventBody } from "./build-event-registration-register-event-body";
import { resolveEventRegistrationOperatorRef } from "./resolve-event-registration-operator-ref";
import type {
    EventRegistrationDraft,
    EventRegistrationSnapshot,
    ScrapRemovalMode,
    UnprocessedMachineEvent,
} from "./types";

export type EventRegistrationRegisterEventParams = {
    wizardSessionId: string;
    workAreaId: string;
    operatorRef?: string;
    draft: EventRegistrationDraft;
    scrapMode: ScrapRemovalMode;
    selectedSignal: UnprocessedMachineEvent | null;
    snapshot: Pick<EventRegistrationSnapshot, "rollCatalog" | "cardColorCatalog">;
};

export function useEventRegistrationRegisterEvent() {
    const { session } = useSession();

    const { mutateAsync: registerProductionEvent, isPending, error, reset } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.registerProductionEvent,
        {},
    );

    const registerEvent = useCallback(
        async (
            params: EventRegistrationRegisterEventParams,
        ): Promise<ApiSchemas["OrderExecutionProductionEventRegisterResponse"]> => {
            const wizardSessionId = params.wizardSessionId.trim();
            if (!wizardSessionId) {
                throw new Error("Не удалось определить сессию мастера регистрации события");
            }

            const workAreaId = params.workAreaId.trim();
            if (!workAreaId) {
                throw new Error("Не удалось определить workAreaId этапа");
            }

            if (params.draft.eventCode == null) {
                throw new Error("Укажите код события");
            }

            const operatorRef = resolveEventRegistrationOperatorRef(session, params.operatorRef);

            return registerProductionEvent({
                body: buildEventRegistrationRegisterEventBody({
                    wizardSessionId,
                    workAreaId,
                    operatorRef: operatorRef || undefined,
                    draft: params.draft,
                    scrapMode: params.scrapMode,
                    selectedSignal: params.selectedSignal,
                    snapshot: params.snapshot,
                }),
            });
        },
        [registerProductionEvent, session],
    );

    return {
        registerEvent,
        isRegisterEventPending: isPending,
        registerEventError: error,
        resetRegisterEvent: reset,
    };
}
