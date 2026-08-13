import { productionStageStatusLabel } from "./stage-status";
import type { ProductionStage } from "./types";

function collectSearchValues(stage: ProductionStage): string[] {
    const values: Array<string | number | undefined> = [
        stage.orderId,
        stage.projectNumber,
        stage.stageId,
        stage.internalStageId,
        stage.workAreaId,
        stage.client,
        stage.clientNumber,
        stage.product,
        stage.itemStageName,
        stage.stageName,
        stage.area,
        stage.machine,
        stage.operationNo,
        stage.unit,
        stage.orderDate,
        stage.startAt,
        stage.endAt,
        productionStageStatusLabel(stage),
    ];

    if (stage.quantity !== undefined) {
        values.push(stage.quantity, stage.quantity.toLocaleString("ru-RU"));
    }

    return values
        .filter((value) => value !== undefined && value !== "")
        .map((value) => String(value).toLowerCase());
}

export function matchesProductionStageSearch(stage: ProductionStage, query: string): boolean {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
        return true;
    }

    return collectSearchValues(stage).some((value) => value.includes(normalizedQuery));
}
