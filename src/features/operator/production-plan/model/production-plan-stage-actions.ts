import { statusLabel } from "./stage-status";
import type { ProductionPlanAction, ProductionStage } from "./types";

export type { ProductionPlanAction } from "./types";

export type ApplyProductionPlanActionOptions = {
    /** Обязателен для действия `pause` */
    comment?: string;
};

function normalizeMachineKey(machine: string | undefined): string {
    return (machine ?? "").trim().toUpperCase();
}

/** На одной машине одновременно может быть только один этап «в работе». */
export function hasStageInProgressOnMachine(
    stages: ProductionStage[],
    machine: string | undefined,
): boolean {
    const machineKey = normalizeMachineKey(machine);

    return stages.some(
        (item) => item.status === "in_progress" && normalizeMachineKey(item.machine) === machineKey,
    );
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

    const machineBusy = hasStageInProgressOnMachine(stages, stage.machine);

    if (stage.allowedActions) {
        return hasAllowedAction(stage, "start") && !machineBusy;
    }

    return stage.status === "planned" && !machineBusy;
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

    const machineBusy = hasStageInProgressOnMachine(stages, stage.machine);

    if (stage.allowedActions) {
        return hasAllowedAction(stage, "continue") && !machineBusy;
    }

    return stage.status === "paused" && !machineBusy;
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
            return {
                ...stage,
                status: "in_progress",
                statusDisplayLabel: statusLabel("in_progress"),
            };
        }

        if (action === "pause") {
            return {
                ...stage,
                status: "paused",
                statusDisplayLabel: statusLabel("paused"),
            };
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
