import { HttpResponse } from "msw";
import { http } from "../http";
import type { ApiSchemas } from "../../schema";
import { verifyTokenOrThrow } from "../session";

export const mockSummaryData: ApiSchemas["Summary"] = {
    systems: [
        {
            id: "system-1",
            systemName: "Система охлаждения",
            availability: "98.5%",
            activeRequests: 12,
            averageResponseTime: "0.45s",
            onTimeCompletion: "99.2%",
            icon: "cooling",
            status: "operational",
            activeAlerts: 2,
            equipmentCount: 45,
            onlineEquipment: 43,
            lastUpdate: "2024-01-15T10:30:00Z",
        },
        {
            id: "system-2",
            systemName: "Электропитание",
            availability: "99.8%",
            activeRequests: 8,
            averageResponseTime: "0.23s",
            onTimeCompletion: "99.9%",
            icon: "power",
            status: "operational",
            activeAlerts: 0,
            equipmentCount: 28,
            onlineEquipment: 28,
            lastUpdate: "2024-01-15T10:28:00Z",
        },
        {
            id: "system-3",
            systemName: "Вентиляция",
            availability: "95.2%",
            activeRequests: 15,
            averageResponseTime: "0.78s",
            onTimeCompletion: "96.8%",
            icon: "ventilation",
            status: "degraded",
            activeAlerts: 5,
            equipmentCount: 32,
            onlineEquipment: 30,
            lastUpdate: "2024-01-15T10:25:00Z",
        },
        {
            id: "system-4",
            systemName: "Водоснабжение",
            availability: "99.5%",
            activeRequests: 6,
            averageResponseTime: "0.34s",
            onTimeCompletion: "99.7%",
            icon: "water",
            status: "operational",
            activeAlerts: 1,
            equipmentCount: 18,
            onlineEquipment: 18,
            lastUpdate: "2024-01-15T10:32:00Z",
        },
    ],
    kpi: {
        totalActive: 41,
        averageResponseTime: "0.45s",
        onTimeCompletion: "98.9%",
        criticalIncidents: 3,
    },
    equipment: [
        {
            id: "equip-1",
            name: "Чиллер №1",
            systemId: "system-1",
            systemLabel: "Охлаждение",
            status: "online",
            statusLabel: "В работе",
            location: "ЦОД А, этаж 2",
            lastMaintenanceDate: "2024-01-10T14:00:00Z",
        },
        {
            id: "equip-2",
            name: "ИБП Главный",
            systemId: "system-2",
            systemLabel: "Электропитание",
            status: "online",
            statusLabel: "В работе",
            location: "ЦОД А, этаж 1",
            lastMaintenanceDate: "2024-01-12T09:30:00Z",
        },
        {
            id: "equip-3",
            name: "Вентиляторная установка №3",
            systemId: "system-3",
            systemLabel: "Вентиляция",
            status: "offline",
            statusLabel: "На обслуживании",
            location: "ЦОД Б, этаж 3",
            lastMaintenanceDate: "2024-01-14T16:45:00Z",
        },
        {
            id: "equip-4",
            name: "Насосная станция №2",
            systemId: "system-4",
            systemLabel: "Водоснабжение",
            status: "online",
            statusLabel: "В работе",
            location: "Технический этаж",
            lastMaintenanceDate: "2024-01-08T11:20:00Z",
        },
        {
            id: "equip-5",
            name: "Теплообменник №1",
            systemId: "system-1",
            systemLabel: "Охлаждение",
            status: "warning",
            statusLabel: "Пониженная эффективность",
            location: "ЦОД А, этаж 2",
            lastMaintenanceDate: "2024-01-05T13:15:00Z",
        },
        {
            id: "equip-6",
            name: "Резервный ИБП",
            systemId: "system-2",
            systemLabel: "Электропитание",
            status: "online",
            statusLabel: "В режиме ожидания",
            location: "ЦОД А, этаж 1",
            lastMaintenanceDate: "2024-01-11T10:00:00Z",
        },
    ],
};

// Мок для успешного ответа
export const mockSummaryResponse = {
    status: 200,
    data: mockSummaryData,
};

// Мок для пустого состояния (если нужно)
export const mockEmptySummary: ApiSchemas["Summary"] = {
    systems: [],
    kpi: {
        totalActive: 0,
        averageResponseTime: "0s",
        onTimeCompletion: "0%",
        criticalIncidents: 0,
    },
    equipment: [],
};

// Мок для загрузки (если нужно показать скелетон)
export const mockLoadingSummary: Partial<ApiSchemas["Summary"]> = {
    systems: undefined,
    kpi: undefined,
    equipment: undefined,
};

export const summaryHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/getSummaryData", async (ctx) => {
        await verifyTokenOrThrow(ctx.request);
        return HttpResponse.json(mockSummaryData);
    }),
];
