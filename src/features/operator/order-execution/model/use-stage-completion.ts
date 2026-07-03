import { useCallback, useMemo, useState } from "react";

import type { MachineId } from "./types";
import { getStageCompletionSnapshot } from "./stage-completion-mock";

export function useStageCompletion(machineId: MachineId) {
    const snapshot = useMemo(() => getStageCompletionSnapshot(machineId), [machineId]);

    const completionHints = useMemo(() => {
        const hints: string[] = [];
        if (snapshot.pendingEvents.length > 0) {
            hints.push("Есть необработанные события. Обработайте события брака и простоев перед завершением этапа.");
        }
        if (snapshot.incomingRolls.some((roll) => roll.status !== "Доступно" && roll.status !== "Заблокирован")) {
            hints.push("Не все входящие рулоны списаны полностью или частично с возвратом.");
        }
        if (snapshot.releasedSeries.length === 0) {
            hints.push("Нет зарегистрированных выпущенных рулонов с весами и метражом.");
        }
        return hints;
    }, [snapshot.incomingRolls, snapshot.pendingEvents.length, snapshot.releasedSeries.length]);

    const canSubmitPrerequisites = useMemo(() => {
        return completionHints.length === 0;
    }, [completionHints.length]);

    const canCompleteStage = useMemo(
        () => canSubmitPrerequisites && !snapshot.hasSuspendedStageOnMachine,
        [canSubmitPrerequisites, snapshot.hasSuspendedStageOnMachine],
    );

    const [stageCompleted, setStageCompleted] = useState(false);
    const [comment, setComment] = useState("");
    const [expandedEventId, setExpandedEventId] = useState(snapshot.eventJournal.find((event) => event.details)?.id ?? null);

    const tryFinalizeStage = useCallback(() => {
        if (!canSubmitPrerequisites) return;
        if (!canCompleteStage) return;
        setStageCompleted(true);
    }, [canCompleteStage, canSubmitPrerequisites]);

    return {
        snapshot,
        comment,
        setComment,
        expandedEventId,
        setExpandedEventId,
        completionHints,
        canSubmitPrerequisites,
        canCompleteStage,
        stageCompleted,
        tryFinalizeStage,
    };
}

export type StageCompletionModel = ReturnType<typeof useStageCompletion>;
