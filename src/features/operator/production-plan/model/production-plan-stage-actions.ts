import type { ProductionPlanAction, ProductionStage } from "./types";

export type { ProductionPlanAction } from "./types";

export type ApplyProductionPlanActionOptions = {
    /** Обязателен для действия `pause` */
    comment?: string;
};

export function hasStageInProgress(stages: ProductionStage[]): boolean {
    return stages.some((stage) => stage.status === "in_progress");
}

function hasAllowedAction(stage: ProductionStage, action: ProductionPlanAction): boolean {
    return stage.allowedActions?.includes(action) ?? false;
}

export function canStartStage(
    stages: ProductionStage[],
    stage: ProductionStage | null | undefined,
): boolean {
    if (!stage) {
        return false;
    }

    if (stage.allowedActions) {
        return hasAllowedAction(stage, "start") && !hasStageInProgress(stages);
    }

    return stage.status === "planned" && !hasStageInProgress(stages);
}

export function canPauseStage(stage: ProductionStage | null | undefined): boolean {
    if (!stage) {
        return false;
    }

    if (stage.allowedActions) {
        return hasAllowedAction(stage, "pause");
    }

    return stage.status === "in_progress";
}

export function canContinueStage(
    stages: ProductionStage[],
    stage: ProductionStage | null | undefined,
): boolean {
    if (!stage) {
        return false;
    }

    if (stage.allowedActions) {
        return hasAllowedAction(stage, "continue") && !hasStageInProgress(stages);
    }

    return stage.status === "paused" && !hasStageInProgress(stages);
}

export function applyStageAction(
    stages: ProductionStage[],
    stageId: string,
    action: ProductionPlanAction,
): ProductionStage[] {
    return stages.map((stage) => {
        if (stage.stageId !== stageId) {
            return stage;
        }

        if (action === "start" || action === "continue") {
            return { ...stage, status: "in_progress" };
        }

        if (action === "pause") {
            return { ...stage, status: "paused" };
        }

        return stage;
    });
}

export function productionPlanActionTitle(action: ProductionPlanAction): string {
    switch (action) {
        case "start":
            return "Взять этап в работу";
        case "pause":
            return "Приостановить этап";
        case "continue":
            return "Продолжить этап";
    }
}

export function productionPlanActionErrorMessage(action: ProductionPlanAction): string {
    switch (action) {
        case "start":
            return "Не удалось взять этап в работу";
        case "pause":
            return "Не удалось приостановить этап";
        case "continue":
            return "Не удалось продолжить этап";
    }
}
