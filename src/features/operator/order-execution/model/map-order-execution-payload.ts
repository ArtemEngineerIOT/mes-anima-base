import type { ApiSchemas } from "@/shared/api/schema";

import { buildOrderExecutionEmptyMachine } from "./mock-order-execution";
import type { MachineData, OrderInfo } from "./types";

const OK_ERROR_CODE = "OK";

function pickString(row: Record<string, unknown> | undefined, ...keys: string[]): string | undefined {
    if (!row) {
        return undefined;
    }

    for (const key of keys) {
        const value = row[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
        if (typeof value === "number" && Number.isFinite(value)) {
            return String(value);
        }
    }
    return undefined;
}

function readWorkAreaId(value: unknown): string | null {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed ? trimmed : null;
    }
    return null;
}

function readUnprocessedEventsCount(resultItem: Record<string, unknown>): number | undefined {
    const badges = resultItem.sidebar_badges;
    if (!Array.isArray(badges) || badges.length === 0) {
        return undefined;
    }

    const badge = badges[0] as Record<string, unknown> | undefined;
    const count = badge?.unprocessed_events_count;
    if (typeof count === "number" && Number.isFinite(count)) {
        return count;
    }
    return undefined;
}

function assertOrderExecutionSuccess(
    payload: ApiSchemas["OrderExecutionResponse"] | undefined,
    fallbackMessage: string,
): ApiSchemas["OrderExecutionResultItem"] | undefined {
    const row = payload?.[0];
    if (!row) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (row.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        const message = row.error_message?.trim();
        throw new Error(message || fallbackMessage);
    }

    return row.result?.[0];
}

function buildJobInfo(headerRow: Record<string, unknown> | undefined) {
    return [
        { key: "Проект", value: pickString(headerRow, "project") ?? "—" },
        { key: "Продукт", value: pickString(headerRow, "product") ?? "—" },
        { key: "Заказ", value: pickString(headerRow, "order") ?? "—" },
        { key: "Клиент", value: pickString(headerRow, "client") ?? "—" },
    ];
}

/** Сливает ответ API с моком экрана (мониторинг и панели оператора пока из мока). */
export function mergeOrderExecutionMachineData(
    apiData: MachineData,
    mockFallback: MachineData | undefined,
): MachineData {
    if (!apiData.hasAssignedStage || !mockFallback) {
        return apiData;
    }

    const unprocessedCount = apiData.unprocessedEventsCount;
    const mockPending = mockFallback.operator.pendingKnifeStrike;

    return {
        ...mockFallback,
        machineId: apiData.machineId,
        workAreaId: apiData.workAreaId,
        unprocessedEventsCount: apiData.unprocessedEventsCount,
        hasAssignedStage: apiData.hasAssignedStage,
        order: apiData.order,
        operator: {
            ...mockFallback.operator,
            jobInfo: apiData.operator.jobInfo,
            orderDetails:
                apiData.operator.orderDetails.productAndOrder.length > 0
                    ? apiData.operator.orderDetails
                    : mockFallback.operator.orderDetails,
            pendingKnifeStrike:
                mockPending && typeof unprocessedCount === "number"
                    ? { ...mockPending, queueCount: unprocessedCount }
                    : mockPending,
        },
    };
}

export function mapOrderExecutionPayload(
    payload: ApiSchemas["OrderExecutionResponse"] | undefined,
    resourceCode: string,
): MachineData {
    const fallbackMessage = "Не удалось загрузить данные по машине";
    const resultItem = assertOrderExecutionSuccess(payload, fallbackMessage);
    const base = buildOrderExecutionEmptyMachine(resourceCode);

    if (!resultItem) {
        return base;
    }

    const record = resultItem as Record<string, unknown>;
    const workAreaId = readWorkAreaId(record.work_area_id);
    const hasAssignedStage = workAreaId !== null;

    const headerRow = Array.isArray(record.header)
        ? (record.header[0] as Record<string, unknown> | undefined)
        : undefined;

    const order: OrderInfo = {
        orderId: pickString(headerRow, "order") ?? "—",
        product: pickString(headerRow, "product") ?? "—",
        client: pickString(headerRow, "client") ?? "—",
        status: hasAssignedStage ? "Исполнение заказа" : "Ожидание",
    };

    const unprocessedEventsCount = readUnprocessedEventsCount(record);

    return {
        ...base,
        workAreaId: workAreaId ?? undefined,
        unprocessedEventsCount,
        hasAssignedStage,
        order,
        operator: {
            ...base.operator,
            jobInfo: buildJobInfo(headerRow),
        },
    };
}
