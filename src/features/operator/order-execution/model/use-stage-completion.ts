import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useSession } from "@/shared/model/session";

import { mapStageCompletionInitPayload } from "./map-stage-completion-init-payload";
import { mapStageCompletionSubmitPayload } from "./map-stage-completion-submit-payload";
import { resolveReleaseOperatorRef } from "./release/resolve-release-operator-ref";
import {
    EMPTY_STAGE_COMPLETION_SNAPSHOT,
    type StageCompletionSnapshot,
} from "./stage-completion-types";

type UseStageCompletionOptions = {
    workAreaId?: string;
    enabled: boolean;
};

export function useStageCompletion({ workAreaId, enabled }: UseStageCompletionOptions) {
    const { session } = useSession();
    const [snapshot, setSnapshot] = useState<StageCompletionSnapshot>(EMPTY_STAGE_COMPLETION_SNAPSHOT);
    const [isInitLoading, setIsInitLoading] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);
    const [stageCompleted, setStageCompleted] = useState(false);
    const [comment, setComment] = useState("");
    const [expandedEventIds, setExpandedEventIds] = useState<ReadonlySet<string>>(() => new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { mutateAsync: fetchStageCompletionInit } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.orderStageCompletionInit,
        {},
    );
    const { mutateAsync: submitStageCompletion } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.orderStageCompletionSubmit,
        {},
    );
    const fetchStageCompletionInitRef = useRef(fetchStageCompletionInit);
    fetchStageCompletionInitRef.current = fetchStageCompletionInit;
    const submitStageCompletionRef = useRef(submitStageCompletion);
    submitStageCompletionRef.current = submitStageCompletion;

    const loadInit = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            setSnapshot(EMPTY_STAGE_COMPLETION_SNAPSHOT);
            setInitError("Не удалось определить workAreaId этапа");
            return;
        }

        setIsInitLoading(true);
        setInitError(null);

        try {
            const payload = await fetchStageCompletionInitRef.current({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });
            const mapped = mapStageCompletionInitPayload(payload);
            setSnapshot(mapped);
            setExpandedEventIds(new Set());
        } catch (error) {
            setSnapshot(EMPTY_STAGE_COMPLETION_SNAPSHOT);
            setExpandedEventIds(new Set());
            setInitError(
                error instanceof Error ? error.message : "Не удалось загрузить данные завершения этапа",
            );
        } finally {
            setIsInitLoading(false);
        }
    }, [workAreaId]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        void loadInit();
    }, [enabled, loadInit]);

    const canSubmitPrerequisites = snapshot.canComplete && !stageCompleted && !isSubmitting;
    const canCompleteStage = canSubmitPrerequisites && !snapshot.hasSuspendedStageOnMachine;
    const completionHints = snapshot.blockingIssues.map((issue) => issue.message);

    const toggleExpandedEventId = useCallback((eventId: string) => {
        setExpandedEventIds((prev) => {
            const next = new Set(prev);
            if (next.has(eventId)) {
                next.delete(eventId);
            } else {
                next.add(eventId);
            }
            return next;
        });
    }, []);

    const tryFinalizeStage = useCallback(async (): Promise<{ showSuspendedModal: boolean }> => {
        if (!canSubmitPrerequisites) {
            return { showSuspendedModal: false };
        }

        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            setSubmitError("Не удалось определить workAreaId этапа");
            return { showSuspendedModal: false };
        }

        const completedBy = resolveReleaseOperatorRef(session);
        if (!completedBy) {
            setSubmitError("Не удалось определить оператора (mesUserProfile)");
            return { showSuspendedModal: false };
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const payload = await submitStageCompletionRef.current({
                body: [
                    {
                        workAreaId: trimmedWorkAreaId,
                        completedBy,
                        comment: comment.trim(),
                    },
                ],
            });
            const mapped = mapStageCompletionSubmitPayload(payload);

            if (!mapped.ok) {
                setSnapshot((prev) => ({
                    ...prev,
                    canComplete: false,
                    blockingIssues:
                        mapped.blockingIssues.length > 0
                            ? mapped.blockingIssues
                            : [{ code: mapped.errorCode, message: mapped.errorMessage }],
                }));
                setSubmitError(mapped.errorMessage);
                return { showSuspendedModal: false };
            }

            setStageCompleted(true);
            if (mapped.pausedSiblingModal) {
                setSnapshot((prev) => ({
                    ...prev,
                    hasSuspendedStageOnMachine: true,
                    suspendedStageLabel: mapped.pausedSiblingModal?.message || mapped.pausedSiblingModal?.title,
                }));
                return { showSuspendedModal: true };
            }

            return { showSuspendedModal: false };
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Не удалось завершить этап");
            return { showSuspendedModal: false };
        } finally {
            setIsSubmitting(false);
        }
    }, [canSubmitPrerequisites, comment, session, workAreaId]);

    return {
        snapshot,
        comment,
        setComment,
        expandedEventIds,
        toggleExpandedEventId,
        completionHints,
        canSubmitPrerequisites,
        canCompleteStage,
        stageCompleted,
        tryFinalizeStage,
        isInitLoading,
        initError,
        isSubmitting,
        submitError,
        reloadInit: loadInit,
    };
}

export type StageCompletionModel = ReturnType<typeof useStageCompletion>;
