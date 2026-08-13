import { useState } from "react";
import { useNavigate } from "react-router";

import { cn } from "@/shared/lib/css";
import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { FloatingAutoDismissInformer } from "@/shared/ui/kit/floating-auto-dismiss-informer";
import { dataTableHeadCellClassName } from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";
import { Informer } from "@/shared/ui/kit/informer";

import { useStageCompletion } from "../../model/use-stage-completion";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { StageCompletionEventJournalTable } from "./stage-completion-event-journal-table";
import { StageCompletionIncomingRollsTable } from "./stage-completion-incoming-rolls-table";
import { StageCompletionPendingEventsTable } from "./stage-completion-pending-events-table";
import { StageCompletionReleasedSeriesTable } from "./stage-completion-released-series-table";

type OrderExecutionStageCompletionSectionProps = {
    workAreaId?: string;
};

export function OrderExecutionStageCompletionSection({ workAreaId }: OrderExecutionStageCompletionSectionProps) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const m = useStageCompletion({ workAreaId, enabled: expanded });
    const { snapshot } = m;

    const headerTone =
        m.completionHints.length > 0 && !m.stageCompleted
            ? ("alert" as const)
            : m.stageCompleted
              ? ("success" as const)
              : undefined;
    const headerCount =
        m.stageCompleted ? undefined : m.completionHints.length > 0 ? m.completionHints.length : undefined;

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
        m.completionHints.length === 1
            ? m.completionHints[0]
            : m.completionHints.length > 1
              ? (
                    <ul className="list-disc space-y-1 pl-4">
                        {m.completionHints.map((hint) => (
                            <li key={hint}>{hint}</li>
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
                keepMounted
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

                    {!m.stageCompleted && m.completionHints.length > 0 ? (
                        <Informer
                            tone="warning"
                            variant="filled"
                            size="s"
                            title="Невозможно завершить этап"
                            description={blockingDescription}
                        />
                    ) : null}

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
