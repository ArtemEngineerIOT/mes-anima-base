import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { cn } from "@/shared/lib/css";
import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { FloatingAutoDismissInformer } from "@/shared/ui/kit/floating-auto-dismiss-informer";
import { dataTableHeadCellClassName } from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { Informer } from "@/shared/ui/kit/informer";

import type { StageCompletionReadinessSnapshot } from "../../model/stage-completion-readiness/types";
import { useStageCompletionReadiness } from "../../model/stage-completion-readiness/use-stage-completion-readiness";
import { useStageCompletion } from "../../model/use-stage-completion";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { StageCompletionEventJournalTable } from "./stage-completion-event-journal-table";
import { StageCompletionIncomingRollsTable } from "./stage-completion-incoming-rolls-table";
import { StageCompletionPendingEventsTable } from "./stage-completion-pending-events-table";
import { StageCompletionReleasedSeriesTable } from "./stage-completion-released-series-table";

const STAGE_COMPLETION_SILENT_RELOAD_DEBOUNCE_MS = 300;

type OrderExecutionStageCompletionSectionProps = {
    workAreaId?: string;
    initialReadiness?: StageCompletionReadinessSnapshot | null;
    readinessEnabled: boolean;
};

export function OrderExecutionStageCompletionSection({
    workAreaId,
    initialReadiness = null,
    readinessEnabled,
}: OrderExecutionStageCompletionSectionProps) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const initSilentReloadRef = useRef<(() => void) | null>(null);
    const silentReloadDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (silentReloadDebounceTimerRef.current !== null) {
                clearTimeout(silentReloadDebounceTimerRef.current);
            }
        };
    }, []);

    const { canComplete, blockerCount, blockingIssues, snapshot: readiness } = useStageCompletionReadiness({
        workAreaId,
        initialSnapshot: initialReadiness,
        enabled: readinessEnabled,
        onReadinessChanged: () => {
            if (silentReloadDebounceTimerRef.current !== null) {
                clearTimeout(silentReloadDebounceTimerRef.current);
            }

            silentReloadDebounceTimerRef.current = setTimeout(() => {
                initSilentReloadRef.current?.();
            }, STAGE_COMPLETION_SILENT_RELOAD_DEBOUNCE_MS);
        },
    });

    const m = useStageCompletion({ workAreaId, enabled: expanded, canComplete });
    const { snapshot, reloadInit } = m;

    useEffect(() => {
        if (!expanded) {
            initSilentReloadRef.current = null;
            return;
        }

        initSilentReloadRef.current = () => {
            void reloadInit({ silent: true });
        };

        return () => {
            initSilentReloadRef.current = null;
        };
    }, [expanded, reloadInit]);

    const headerTone = m.stageCompleted
        ? ("success" as const)
        : blockerCount > 0
          ? ("alert" as const)
          : undefined;
    const headerCount = m.stageCompleted ? undefined : blockerCount > 0 ? blockerCount : undefined;

    const handleCompleteStageClick = () => {
        if (!m.canSubmitPrerequisites || m.stageCompleted) return;
        void m.tryFinalizeStage().then((result) => {
            if (!result.completed) {
                return;
            }

            navigate(ROUTES.OPERATOR.PRODUCTION_PLAN, {
                state: result.showSuspendedModal
                    ? { suspendedStageLabel: result.suspendedStageLabel }
                    : undefined,
            });
        });
    };

    const blockingDescription =
        blockingIssues.length === 1
            ? blockingIssues[0].message
            : blockingIssues.length > 1
              ? (
                    <ul className="list-disc space-y-1 pl-4">
                        {blockingIssues.map((issue) => (
                            <li key={issue.code || issue.message}>{issue.message}</li>
                        ))}
                    </ul>
                )
              : "Завершение этапа сейчас недоступно.";

    return (
        <>
            <OrderExecutionCollapsibleSection
                title="Завершить этап"
                defaultOpen={false}
                tone={headerTone}
                count={headerCount}
                updatedAt={expanded ? readiness.changedAt : undefined}
                keepMounted
                isContentReady={!m.isInitLoading}
                onExpandedChange={setExpanded}
            >
                <div className="flex flex-col gap-5">
                    {m.initError ? (
                        <Informer
                            tone="alert"
                            variant="bordered"
                            size="s"
                            title="Ошибка загрузки"
                            description={m.initError}
                        />
                    ) : null}

                    {m.stageCompleted ? (
                        <Informer
                            tone="success"
                            variant="filled"
                            size="s"
                            title="Этап завершён"
                            description="Дальнейшие операции по заказу в MES заблокированы. Данные переданы в 1С (макет до интеграции)."
                        />
                    ) : null}

                    <div className={cnSectionBlockTitle()}>История операций по этапу</div>

                    <StageCompletionIncomingRollsTable rows={snapshot.incomingRolls} />

                    <StageCompletionReleasedSeriesTable rows={snapshot.releasedSeries} />

                    <div className="text-right text-[12px] font-bold uppercase text-foreground">
                        Расчётный брак: {snapshot.defectPercent}%
                    </div>

                    <StageCompletionEventJournalTable
                        rows={snapshot.eventJournal}
                        totalEventMeterage={snapshot.totalEventMeterage}
                    />

                    <StageCompletionPendingEventsTable rows={snapshot.pendingEvents} />

                    <div className="grid gap-2">
                        <div className={cn(dataTableHeadCellClassName, "px-0")}>Комментарий</div>
                        <textarea
                            className="min-h-16 w-full rounded-sm border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            placeholder="Заполните при необходимости"
                            value={m.comment}
                            onChange={(event) => m.setComment(event.target.value)}
                            disabled={m.stageCompleted || m.isSubmitting}
                        />
                    </div>

                    {!m.stageCompleted && blockingIssues.length > 0 ? (
                        <Informer
                            tone="warning"
                            variant="bordered"
                            size="s"
                            title="Невозможно завершить этап"
                            description={blockingDescription}
                        />
                    ) : null}

                    <div className="flex justify-end">
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleCompleteStageClick}
                            pending={m.isSubmitting}
                            pendingLabel="Завершение…"
                            disabled={!m.canSubmitPrerequisites || m.stageCompleted}
                        >
                            Завершить этап
                        </Button>
                    </div>
                </div>
            </OrderExecutionCollapsibleSection>

            {m.submitError ? (
                <FloatingAutoDismissInformer
                    key={`stage-completion-submit:${m.submitError}`}
                    tone="alert"
                    variant="bordered"
                    size="s"
                    title="Ошибка"
                    description={m.submitError}
                    onDismiss={m.dismissSubmitError}
                />
            ) : null}
        </>
    );
}
