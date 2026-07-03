import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

/** Приоритет для цвета колокольчика: чем «правее» в union, тем сильнее внимание. */
export type NotificationBellTone = "none" | "info" | "warning" | "alert";

type HeaderNotifications = {
    /** Сколько пунктов учитывается в индикаторе (системные + общие непрочитанные). */
    count: number;
    /** Цвет иконки по максимальной серьёзности среди активных уведомлений. */
    bellTone: NotificationBellTone;
};

type SystemNotificationsContextValue = {
    /** Интеграция с 1С / DWH недоступна (панель уведомлений, глобальный индикатор). Задаётся на уровне системы, не страниц. */
    oneCServiceUnavailable: boolean;
    setOneCServiceUnavailable: (value: boolean) => void;
    /** Непрочитанные общесистемные сообщения (лента); позже — из API / store. */
    generalUnreadCount: number;
    setGeneralUnreadCount: (value: number) => void;
    headerNotifications: HeaderNotifications;
};

const SystemNotificationsContext = createContext<SystemNotificationsContextValue | null>(null);

function maxBellTone(a: NotificationBellTone, b: NotificationBellTone): NotificationBellTone {
    const order: NotificationBellTone[] = ["none", "info", "warning", "alert"];
    return order[Math.max(order.indexOf(a), order.indexOf(b))]!;
}

/** Стартовое значение до интеграции с системным health/bootstrap (оставьте false в проде при отсутствии инцидента). */
const INITIAL_ONE_C_SERVICE_UNAVAILABLE = true;

export function SystemNotificationsProvider({ children }: { children: ReactNode }) {
    const [oneCServiceUnavailable, setOneCState] = useState(INITIAL_ONE_C_SERVICE_UNAVAILABLE);
    const [generalUnreadCount, setGeneralUnreadCountState] = useState(0);

    const setOneCServiceUnavailable = useCallback((value: boolean) => {
        setOneCState(value);
    }, []);

    const setGeneralUnreadCount = useCallback((value: number) => {
        setGeneralUnreadCountState(Math.max(0, Math.floor(value)));
    }, []);

    const headerNotifications = useMemo((): HeaderNotifications => {
        const oneCSeverity: NotificationBellTone = oneCServiceUnavailable ? "alert" : "none";
        const generalSeverity: NotificationBellTone =
            generalUnreadCount > 0 ? "info" : "none";

        const count = (oneCServiceUnavailable ? 1 : 0) + generalUnreadCount;
        const bellTone = maxBellTone(oneCSeverity, generalSeverity);

        return { count, bellTone };
    }, [generalUnreadCount, oneCServiceUnavailable]);

    const value = useMemo(
        () => ({
            oneCServiceUnavailable,
            setOneCServiceUnavailable,
            generalUnreadCount,
            setGeneralUnreadCount,
            headerNotifications,
        }),
        [
            generalUnreadCount,
            headerNotifications,
            oneCServiceUnavailable,
            setGeneralUnreadCount,
            setOneCServiceUnavailable,
        ],
    );

    return (
        <SystemNotificationsContext.Provider value={value}>{children}</SystemNotificationsContext.Provider>
    );
}

export function useSystemNotifications(): SystemNotificationsContextValue {
    const ctx = useContext(SystemNotificationsContext);
    if (!ctx) {
        throw new Error("useSystemNotifications must be used within SystemNotificationsProvider");
    }
    return ctx;
}
