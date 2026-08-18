import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useSession } from "@/shared/model/session";

import { useSyncLoadingOnEnable } from "../use-loading-on-enable";
import { resolveReleaseOperatorRef } from "../release/resolve-release-operator-ref";
import { buildProcessControlPayloadJson } from "./build-save-process-control-body";
import {
    PROCESS_CONTROL_CHECKLIST_ROWS,
    PROCESS_CONTROL_INFO_BLOCKS,
} from "./process-control-data";
import {
    createEmptyProcessControlForm,
    mapProcessControlPayload,
    mapProcessControlSavePayload,
} from "./map-process-control-payload";
import {
    sanitizeProcessControlDecimalInput,
    sanitizeProcessControlIntegerInput,
} from "./sanitize-process-control-numeric-input";
import type { ProcessControlFormState } from "./types";

type ProcessControlSaveFeedback = {
    key: number;
    tone: "success" | "alert";
    title: string;
    description?: string;
};

type UseProcessControlOptions = {
    workAreaId?: string;
    enabled?: boolean;
};

export function useProcessControl({ workAreaId, enabled = true }: UseProcessControlOptions = {}) {
    const { session } = useSession();
    const [form, setForm] = useState<ProcessControlFormState>(createEmptyProcessControlForm);
    const [updatedAt, setUpdatedAt] = useState("");
    const [isLoading, setIsLoading] = useState(enabled);
    useSyncLoadingOnEnable(enabled, setIsLoading);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveFeedback, setSaveFeedback] = useState<ProcessControlSaveFeedback | null>(null);
    const saveFeedbackKeyRef = useRef(0);

    const { mutateAsync: fetchProcessControl } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getProcessControl,
        {},
    );
    const { mutateAsync: saveProcessControl } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.saveProcessControl,
        {},
    );

    const fetchProcessControlRef = useRef(fetchProcessControl);
    fetchProcessControlRef.current = fetchProcessControl;
    const saveProcessControlRef = useRef(saveProcessControl);
    saveProcessControlRef.current = saveProcessControl;
    const formRef = useRef(form);
    formRef.current = form;

    const resetState = useCallback(() => {
        setForm(createEmptyProcessControlForm());
        setUpdatedAt("");
        setError(null);
        setSaveFeedback(null);
    }, []);

    const dismissSaveFeedback = useCallback(() => {
        setSaveFeedback(null);
    }, []);

    const showSaveFeedback = useCallback(
        (title: string, tone: ProcessControlSaveFeedback["tone"], description?: string) => {
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

    const load = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            resetState();
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = await fetchProcessControlRef.current({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });
            const mapped = mapProcessControlPayload(payload);
            setForm(mapped.form);
            setUpdatedAt(mapped.updatedAt);
        } catch (loadError) {
            resetState();
            setError(
                loadError instanceof Error ? loadError.message : "Не удалось загрузить контроль процесса",
            );
        } finally {
            setIsLoading(false);
        }
    }, [resetState, workAreaId]);

    useEffect(() => {
        if (!enabled) {
            resetState();
            setIsLoading(false);
            return;
        }

        void load();
    }, [enabled, load, resetState]);

    const setReplacedElementsCount = useCallback((value: string) => {
        setForm((prev) => ({ ...prev, replacedElementsCount: sanitizeProcessControlIntegerInput(value) }));
    }, []);

    const setPressWidth = useCallback((value: string) => {
        setForm((prev) => ({ ...prev, pressWidth: sanitizeProcessControlDecimalInput(value) }));
    }, []);

    const toggleFlag = useCallback((rowId: string) => {
        setForm((prev) => ({
            ...prev,
            flags: {
                ...prev.flags,
                [rowId]: !prev.flags[rowId],
            },
        }));
    }, []);

    const setChecklistValue = useCallback((rowId: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            checklistValues: {
                ...prev.checklistValues,
                [rowId]: value,
            },
        }));
    }, []);

    const save = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        const operatorRef = resolveReleaseOperatorRef(session);

        if (!trimmedWorkAreaId) {
            showSaveFeedback("Не удалось определить рабочую область этапа", "alert");
            return;
        }

        if (!operatorRef) {
            showSaveFeedback("Не удалось определить оператора для сохранения", "alert");
            return;
        }

        setIsSaving(true);
        setSaveFeedback(null);

        try {
            const payload = await saveProcessControlRef.current({
                body: [
                    {
                        workAreaId: trimmedWorkAreaId,
                        payloadJson: buildProcessControlPayloadJson(formRef.current),
                        operatorRef,
                    },
                ],
            });

            const savedUpdatedAt = mapProcessControlSavePayload(payload);
            if (savedUpdatedAt) {
                setUpdatedAt(savedUpdatedAt);
            } else {
                await load();
            }

            showSaveFeedback("Контроль процесса сохранён", "success");
        } catch (saveRequestError) {
            showSaveFeedback(
                "Ошибка",
                "alert",
                saveRequestError instanceof Error
                    ? saveRequestError.message
                    : "Не удалось сохранить контроль процесса",
            );
        } finally {
            setIsSaving(false);
        }
    }, [load, session, showSaveFeedback, workAreaId]);

    return {
        form,
        updatedAt,
        setReplacedElementsCount,
        setPressWidth,
        toggleFlag,
        setChecklistValue,
        checklistRows: PROCESS_CONTROL_CHECKLIST_ROWS,
        infoBlocks: PROCESS_CONTROL_INFO_BLOCKS,
        isLoading,
        isSaving,
        error,
        saveFeedback,
        dismissSaveFeedback,
        save,
        reload: load,
    };
}
