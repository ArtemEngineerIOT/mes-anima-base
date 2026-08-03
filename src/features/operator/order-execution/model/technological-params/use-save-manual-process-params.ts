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

export function useSaveManualProcessParams({ workAreaId }: UseSaveManualProcessParamsOptions = {}) {
    const { session } = useSession();
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const { mutateAsync: saveManualProcessParams } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.saveManualProcessParams,
        {},
    );

    const saveManualProcessParamsRef = useRef(saveManualProcessParams);
    saveManualProcessParamsRef.current = saveManualProcessParams;

    const save = useCallback(
        async ({ sections, draft }: SaveManualProcessParamsInput) => {
            const trimmedWorkAreaId = workAreaId?.trim() ?? "";
            const externalSeriesKey = draft.manualInputMeta.rollNumber.trim();
            const operatorRef = resolveReleaseOperatorRef(session);

            if (!trimmedWorkAreaId) {
                setSaveError("Не удалось определить workAreaId этапа");
                return false;
            }

            if (!externalSeriesKey) {
                setSaveError("Укажите номер рулона");
                return false;
            }

            if (!operatorRef) {
                setSaveError("Не удалось определить оператора для сохранения");
                return false;
            }

            const payloadJson = buildManualProcessParamsPayloadJson({
                workAreaId: trimmedWorkAreaId,
                materialRollId: externalSeriesKey,
                externalSeriesKey,
                sections,
                manualValues: draft.manualValues,
                presserWidth: draft.presserWidth,
                presserNumbers: draft.presserNumbers,
            });

            if (countManualProcessParams(payloadJson) === 0) {
                setSaveError("Заполните хотя бы один параметр для сохранения");
                return false;
            }

            setIsSaving(true);
            setSaveError(null);

            try {
                const payload = await saveManualProcessParamsRef.current({
                    body: [
                        {
                            workAreaId: trimmedWorkAreaId,
                            materialRollId: externalSeriesKey,
                            externalSeriesKey,
                            payloadJson,
                            operatorRef,
                        },
                    ],
                });
                mapSaveManualProcessParamsPayload(payload);
                return true;
            } catch (error) {
                setSaveError(
                    error instanceof Error
                        ? error.message
                        : "Не удалось сохранить ручной срез технологических параметров",
                );
                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [session, workAreaId],
    );

    const clearSaveError = useCallback(() => {
        setSaveError(null);
    }, []);

    return {
        save,
        isSaving,
        saveError,
        clearSaveError,
    };
}
