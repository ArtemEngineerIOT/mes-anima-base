import { useCallback } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import type { ApiSchemas } from "@/shared/api/schema";
import { useSession, type Session } from "@/shared/model/session";

import { buildEventRegistrationInitWizardBody } from "./build-event-registration-init-wizard-body";

export type EventRegistrationInitWizardParams = {
    workAreaId: string;
    operatorRef?: string;
};

function resolveOperatorRef(session: Session | null | undefined, override?: string): string {
    const explicit = override?.trim();
    if (explicit) return explicit;

    return (
        session?.mesProfile?.employeeId?.trim() ||
        session?.mesProfile?.fio?.trim() ||
        session?.sub?.trim() ||
        ""
    );
}

/**
 * Запрос initWizard (SCR-07 M1): загрузка данных мастера регистрации события.
 * Маппинг ответа — отдельным шагом.
 */
export function useEventRegistrationInitWizard() {
    const { session } = useSession();

    const { mutateAsync: initProductionEventWizard, isPending, error, reset } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.initProductionEventWizard,
        {},
    );

    const initWizard = useCallback(
        async (
            params: EventRegistrationInitWizardParams,
        ): Promise<ApiSchemas["OrderExecutionProductionEventWizardInitResponse"]> => {
            const workAreaId = params.workAreaId.trim();
            if (!workAreaId) {
                throw new Error("Не удалось определить workAreaId этапа");
            }

            const operatorRef = resolveOperatorRef(session, params.operatorRef);
            if (!operatorRef) {
                throw new Error("Не удалось определить оператора (mesUserProfile)");
            }

            return initProductionEventWizard({
                body: buildEventRegistrationInitWizardBody({
                    workAreaId,
                    operatorRef,
                }),
            });
        },
        [initProductionEventWizard, session],
    );

    return {
        initWizard,
        isInitWizardPending: isPending,
        initWizardError: error,
        resetInitWizard: reset,
    };
}
