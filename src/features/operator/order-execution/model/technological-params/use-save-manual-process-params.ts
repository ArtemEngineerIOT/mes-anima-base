import { useCallback, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useSession } from "@/shared/model/session";

import { resolveReleaseOperatorRef } from "../release/resolve-release-operator-ref";
import type { TechnologicalParamsDraft } from "../technological-params-draft";
import type { TechnologicalParamsSections } from "../technological-params-mock";
import {
    buildManualProcessParamsPayloadJson,
    countManualProcessParams,
} from "./build-save-manual-process-params-body";
import { mapSaveManualProcessParamsPayload } from "./map-save-manual-process-params-payload";

type UseSaveManualProcessParamsOptions = {
    workAreaId?: string;
};

type SaveManualProcessParamsInput = {
    sections: TechnologicalParamsSections;
    draft: TechnologicalParamsDraft;
};

export type ManualProcessParamsSaveFeedback = {
    key: number;
    title: string;
    description?: string;
    tone: "success" | "alert";
};

export function useSaveManualProcessParams({ workAreaId }: UseSaveManualProcessParamsOptions = {}) {
    const { session } = useSession();
    const [isSaving, setIsSaving] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState<ManualProcessParamsSaveFeedback | null>(null);
    const saveFeedbackKeyRef = useRef(0);

    const { mutateAsync: saveManualProcessParams } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.saveManualProcessParams,
        {},
    );

    const saveManualProcessParamsRef = useRef(saveManualProcessParams);
    saveManualProcessParamsRef.current = saveManualProcessParams;

    const showSaveFeedback = useCallback(
        (title: string, tone: ManualProcessParamsSaveFeedback["tone"], description?: string) => {
            saveFeedbackKeyRef.current += 1;
            setSaveFeedback({
                key: saveFeedbackKeyRef.current,
                title,
                description,
                tone,
            });
        },
        [],
    );

    const save = useCallback(
        async ({ sections, draft }: SaveManualProcessParamsInput) => {
            const trimmedWorkAreaId = workAreaId?.trim() ?? "";
            const externalSeriesKey = draft.manualInputMeta.rollNumber.trim();
            const operatorRef = resolveReleaseOperatorRef(session);

            if (!trimmedWorkAreaId) {
                showSaveFeedback("Не удалось определить workAreaId этапа", "alert");
                return false;
            }

            if (!externalSeriesKey) {
                showSaveFeedback("Укажите наименование", "alert");
                return false;
            }

            if (!operatorRef) {
                showSaveFeedback("Не удалось определить оператора для сохранения", "alert");
                return false;
            }

            const payloadJson = buildManualProcessParamsPayloadJson({
                workAreaId: trimmedWorkAreaId,
                externalSeriesKey,
                sections,
                manualValues: draft.manualValues,
                presserNumbers: draft.presserNumbers,
            });

            if (countManualProcessParams(payloadJson) === 0) {
                showSaveFeedback("Заполните хотя бы один параметр для сохранения", "alert");
                return false;
            }

            setIsSaving(true);
            setSaveFeedback(null);

            try {
                const payload = await saveManualProcessParamsRef.current({
                    body: [
                        {
                            workAreaId: trimmedWorkAreaId,
                            externalSeriesKey,
                            payloadJson,
                            operatorRef,
                        },
                    ],
                });
                mapSaveManualProcessParamsPayload(payload);
                return true;
            } catch (error) {
                showSaveFeedback(
                    "Ошибка",
                    "alert",
                    error instanceof Error
                        ? error.message
                        : "Не удалось сохранить ручной срез технологических параметров",
                );
                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [session, showSaveFeedback, workAreaId],
    );

    const dismissSaveFeedback = useCallback(() => {
        setSaveFeedback(null);
    }, []);

    return {
        save,
        isSaving,
        saveFeedback,
        dismissSaveFeedback,
    };
}
