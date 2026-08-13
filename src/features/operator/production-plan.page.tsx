import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { OrderExecutionSuspendedStageModal } from "@/features/operator/order-execution/ui/modal/order-execution-suspended-stage-modal";
import { Button } from "@/shared/ui/kit/button";
import { Informer } from "@/shared/ui/kit/informer";

import {
    canContinueStage,
    canPauseStage,
    canStartStage,
    productionPlanActionTitle,
    type ProductionPlanAction,
} from "@/features/operator/production-plan/model/production-plan-stage-actions";
import { useProductionPlan } from "@/features/operator/production-plan/model/use-production-plan";
import { ProductionPlanConfirmDialog } from "@/features/operator/production-plan/ui/modal/production-plan-confirm-dialog";
import { ProductionPlanFilters } from "@/features/operator/production-plan/ui/production-plan-filters";
import { ProductionPlanTable } from "@/features/operator/production-plan/ui/production-plan-table";

type ProductionPlanNavigationState = {
    suspendedStageLabel?: string;
};

function ProductionPlanPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,
        selectedStatuses,
        toggleSelectedStatus,
        clearSelectedStatuses,
        machineOptions,
        isMachineOptionsLoading,
        stages,
        filteredStages,
        selectedId,
        setSelectedId,
        refresh,
        isRefreshing,
        fetchError,
        actionError,
        dataStatus,
        isActionPending,
        applyAction,
    } = useProductionPlan();

    const [confirm, setConfirm] = useState<{ id: string; action: ProductionPlanAction } | null>(null);
    const [pauseComment, setPauseComment] = useState("");
    const [suspendedModalOpen, setSuspendedModalOpen] = useState(false);
    const [suspendedStageLabel, setSuspendedStageLabel] = useState<string | undefined>();

    useEffect(() => {
        const state = location.state as ProductionPlanNavigationState | null;
        const label = state?.suspendedStageLabel?.trim();
        if (!label) {
            return;
        }

        setSuspendedStageLabel(label);
        setSuspendedModalOpen(true);
        navigate(location.pathname, { replace: true, state: null });
    }, [location.pathname, location.state, navigate]);

    const openConfirm = (stageId: string, action: ProductionPlanAction) => {
        if (action !== "pause") {
            setPauseComment("");
        } else {
            // Для нового сценария «Стоп» очищаем комментарий, чтобы пользователь вводил заново.
            setPauseComment("");
        }
        setConfirm({ id: stageId, action });
    };

    const selectedStage = selectedId ? stages.find((stage) => stage.stageId === selectedId) : null;
    const currentConfirmStage = confirm ? stages.find((stage) => stage.stageId === confirm.id) : undefined;
    const canStart = canStartStage(stages, selectedStage);
    const canPause = canPauseStage(selectedStage);
    const canContinue = canContinueStage(stages, selectedStage);

    return (
        <div className="flex h-full min-h-0 flex-col p-4">
            <div className="shrink-0">
                <ProductionPlanFilters
                    filters={filters}
                    machineOptions={machineOptions}
                    isMachineOptionsLoading={isMachineOptionsLoading}
                    searchQuery={searchQuery}
                    isRefreshing={isRefreshing}
                    onFiltersChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
                    onSearchQueryChange={setSearchQuery}
                    onRefresh={() => void refresh()}
                />

                {fetchError && (
                    <Informer
                        className="mt-3"
                        tone="alert"
                        variant="filled"
                        size="s"
                        title="Ошибка загрузки"
                        description={fetchError}
                    />
                )}

                {actionError && (
                    <Informer
                        className="mt-3"
                        tone="alert"
                        variant="filled"
                        size="s"
                        title="Ошибка действия"
                        description={actionError}
                    />
                )}
            </div>

            <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
                {dataStatus === "ready" && (
                    <ProductionPlanTable
                        stages={filteredStages}
                        searchQuery={searchQuery}
                        selectedId={selectedId}
                        selectedStatuses={selectedStatuses}
                        onToggleStatus={toggleSelectedStatus}
                        onClearStatuses={clearSelectedStatuses}
                        onSelect={setSelectedId}
                    />
                )}
                {dataStatus === "empty" && (
                    <Informer
                        tone="warning"
                        variant="filled"
                        size="s"
                        title="Данных нет"
                    />
                )}
            </div>

            {dataStatus === "ready" && (
                <div className="mt-3 flex shrink-0 items-center justify-end gap-2">
                    <Button
                        onClick={() => selectedStage && openConfirm(selectedStage.stageId, "start")}
                        disabled={!canStart || isActionPending}
                    >
                        В работу
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => selectedStage && openConfirm(selectedStage.stageId, "continue")}
                        disabled={!canContinue || isActionPending}
                    >
                        Продолжить
                    </Button>
                    <Button
                        variant="outline"
                        className="hover:bg-destructive/10"
                        onClick={() => selectedStage && openConfirm(selectedStage.stageId, "pause")}
                        disabled={!canPause || isActionPending}
                    >
                        Стоп
                    </Button>
                </div>
            )}

            <ProductionPlanConfirmDialog
                open={!!confirm}
                title={confirm ? productionPlanActionTitle(confirm.action) : ""}
                description={
                    currentConfirmStage?.hasPrevUnfinished && confirm?.action === "start"
                        ? "Перед этапом есть невыполненные этапы. Продолжить всё равно?"
                        : undefined
                }
                confirmText={confirm?.action === "pause" ? "Приостановить" : "Да"}
                comment={confirm?.action === "pause" ? pauseComment : undefined}
                onCommentChange={confirm?.action === "pause" ? setPauseComment : undefined}
                confirmDisabled={confirm?.action === "pause" && !pauseComment.trim()}
                onConfirm={() => {
                    if (!confirm) {
                        return;
                    }
                    return applyAction(confirm.id, confirm.action, {
                        comment: confirm.action === "pause" ? pauseComment : undefined,
                    });
                }}
                onClose={() => {
                    setConfirm(null);
                    setPauseComment("");
                }}
            />

            <OrderExecutionSuspendedStageModal
                open={suspendedModalOpen}
                onOpenChange={setSuspendedModalOpen}
                stageLabel={suspendedStageLabel}
            />
        </div>
    );
}

export const Component = ProductionPlanPage;
