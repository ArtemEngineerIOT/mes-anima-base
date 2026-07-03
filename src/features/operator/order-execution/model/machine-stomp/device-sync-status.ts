import type { InformerPillVariant } from "@/shared/ui/kit/informer-pill";
import type { InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";

export const DEVICE_SYNC_CHARACTERISTIC = "Статус синхронизации";

export const DEVICE_SYNC_FIELD_KEY = "sync_status";

const LEGACY_DEVICE_SYNC_FIELD_KEY = "syncStatus";

export type DeviceSyncStatusCode = 20 | 30 | 40 | 50 | 70 | 80 | 90;

export type DeviceSyncStatusView = {
    label: string;
    informerTone: InformerTone;
    pillVariant: InformerPillVariant;
};

const DEVICE_SYNC_STATUS_MAP: Record<DeviceSyncStatusCode, DeviceSyncStatusView> = {
    20: {
        label: "Синхронизировано",
        informerTone: "success",
        pillVariant: "filled",
    },
    30: {
        label: "Ожидание синхронизации",
        informerTone: "system",
        pillVariant: "outline",
    },
    40: {
        label: "Ошибка синхронизации",
        informerTone: "alert",
        pillVariant: "filled",
    },
    50: {
        label: "Устройство не синхронизировано",
        informerTone: "warning",
        pillVariant: "filled",
    },
    70: {
        label: "Установка соединения с устройством",
        informerTone: "warning",
        pillVariant: "filled",
    },
    80: {
        label: "Чтение метаданных",
        informerTone: "warning",
        pillVariant: "filled",
    },
    90: {
        label: "Синхронизация настроек",
        informerTone: "warning",
        pillVariant: "filled",
    },
};

const UNKNOWN_DEVICE_SYNC_STATUS: DeviceSyncStatusView = {
    label: "Неизвестный статус синхронизации",
    informerTone: "system",
    pillVariant: "outline",
};

function pickSyncCode(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return undefined;
}

export function isDeviceSyncFieldKey(key: string): boolean {
    const normalized = key.trim();
    return normalized === DEVICE_SYNC_FIELD_KEY || normalized === LEGACY_DEVICE_SYNC_FIELD_KEY;
}

export function normalizeDeviceSyncFieldKey(key: string): string {
    return isDeviceSyncFieldKey(key) ? DEVICE_SYNC_FIELD_KEY : key;
}

export function isDeviceSyncCharacteristic(label: string): boolean {
    return isDeviceSyncFieldKey(label) || label.trim() === DEVICE_SYNC_CHARACTERISTIC;
}

export function resolveDeviceSyncStatus(value: unknown): DeviceSyncStatusView {
    const code = pickSyncCode(value);
    if (code === undefined) {
        return UNKNOWN_DEVICE_SYNC_STATUS;
    }

    return DEVICE_SYNC_STATUS_MAP[code as DeviceSyncStatusCode] ?? UNKNOWN_DEVICE_SYNC_STATUS;
}
