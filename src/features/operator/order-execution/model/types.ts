export type MachineId = string;

export type OrderInfo = {
    orderId: string;
    product: string;
    client: string;
    status: "Исполнение заказа" | "Ожидание" | "Остановлен";
};

export type MonitoringStat = {
    label: string;
    value: string;
    tone?: "good" | "neutral" | "bad";
};

export type WasteRow = { roll: string; lengthM: number };
export type OutputRow = { roll: string; lengthM: number; composition?: string; reason?: string };
export type DowntimeRow = { date: string; reason: string };
export type DefectRow = { date: string; reason: string; qty: number };

/** Активное событие «удар ножа», требующее указания причины (UC-20) */
export type PendingKnifeStrike = {
    bannerTitle: string;
    bannerMessage: string;
    reasonOptions: string[];
    /** Начальное значение в списке причин */
    selectedReason?: string;
    /** Количество необработанных событий (бейдж в заголовке блока) */
    queueCount: number;
};

/** Строка таблицы параметров с машины */
export type MachineParamTableRow = {
    parameter: string;
    current: string;
    target: string;
    /** Для режима с колонкой «норма/отклонение»; иначе сравниваем current/target как числа */
    inTolerance?: boolean;
};

/** Строки блока «Подробная информация по заказу» (двухколоночные таблицы) */
export type OrderExecutionOrderDetailKvRow = { parameter: string; value: string };

/** Спецификация продукта: значение и единица измерения */
export type OrderExecutionOrderDetailSpecRow = {
    parameter: string;
    value: string;
    unit: string;
};

export type OrderExecutionOrderDetails = {
    /** ИНФОРМАЦИЯ О ПРОДУКТЕ/ЗАКАЗЕ */
    productAndOrder: OrderExecutionOrderDetailKvRow[];
    /** ЦЕЛЕВЫЕ ПОКАЗАТЕЛИ */
    targetIndicators: OrderExecutionOrderDetailKvRow[];
    /** СПЕЦИФИКАЦИЯ ПРОДУКТА */
    specification: OrderExecutionOrderDetailSpecRow[];
    /** Черновик комментария к заказу (локально редактируется в UI) */
    orderComment?: string;
};

/** Строка таблицы «Зарегистрировать брак» (UC-10) */
export type OperatorDefectRegistrationRow = {
    id: string;
    startM: string;
    endM: string;
    defectType: string;
    flag1: string;
    flag2: string;
    status: string;
    roll: string;
};

export type OperatorDefectRegistration = {
    rows: OperatorDefectRegistrationRow[];
    defectTypeOptions: string[];
    flagOptions: string[];
    statusOptions: string[];
    rollOptions: string[];
};

/** Строка истории «Брак удалённый» (UC-06) */
export type OperatorDefectRemovalHistoryRow = {
    id: string;
    registeredAt: string;
    weightKg: string;
    lengthM: string;
    defect: string;
    note: string;
};

/** Блок «Брак. Удаление» — взвешивание и учёт (UC-06) */
export type OperatorDefectRemoval = {
    history: OperatorDefectRemovalHistoryRow[];
    scaleOptions: string[];
    rollOptions: string[];
    defectTypeOptions: string[];
    formDefaults: {
        scaleId: string;
        rollId: string;
        defectType: string;
        weightKg: string;
    };
    /** События, требующие внимания (иконка в шапке блока), например нет авто-веса */
    headerAlertCount?: number;
};

/** Статус документа JB на экране оператора */
export type JobBagDocumentStatus = "ready_for_print" | "preparation";

/** Строка таблицы JB (лист или весь документ) */
export type JobBagDocumentRow = {
    id: string;
    label: string;
    status: JobBagDocumentStatus;
    statusLabel: string;
};

/** Группа документов JB: «ПО ЛИСТАМ» / «ВЕСЬ ДОКУМЕНТ» */
export type JobBagDocumentGroup = {
    id: "by_sheet" | "whole_document";
    title: string;
    rows: JobBagDocumentRow[];
};

/** Блок «JB» на АРМ оператора */
export type OperatorJbPanel = {
    groups: JobBagDocumentGroup[];
    /** Счётчик в шапке блока (рядом с иконкой info) */
    headerCount?: number;
};

/** Блок «Простои» на АРМ оператора (UC-01) */
export type OperatorDowntimesUiMode = "active" | "unregistered_pending" | "idle";

export type OperatorDowntimeRow = {
    id: string;
    startAt: string;
    endAt: string;
    category: string;
    subcategory: string;
    reason: string;
    note?: string;
};

export type OperatorDowntimesPanel = {
    uiMode: OperatorDowntimesUiMode;
    /** Для таймера «идёт простой»: секунды до «сейчас» от момента старта простоя */
    activeSinceOffsetSeconds?: number;
    /** Текст длительности для баннера «неучтённый простой» */
    unregisteredDurationLabel?: string;
    rows: OperatorDowntimeRow[];
    categoryOptions: string[];
    subcategoryOptions: string[];
    reasonOptions: string[];
    formDefaults: { category: string; subcategory: string; reason: string };
    defaultSelectedIds: string[];
};

export type MachineData = {
    machineId: MachineId;
    /** Идентификатор рабочей области этапа (`work_area_id` из getOrderExecution) */
    workAreaId?: string;
    /** Счётчик необработанных событий (`sidebar_badges.unprocessed_events_count`) */
    unprocessedEventsCount?: number;
    /** На машине есть назначенный этап / исполняется заказ — показываем мониторинг и панель оператора */
    hasAssignedStage: boolean;
    order: OrderInfo;
    monitoring: {
        machineParams: MonitoringStat[];
        inLine: { totalM: number; rollInM: number };
        outLine: { totalM: number; rollOutM: number };
        waste: WasteRow[];
        output: OutputRow[];
        downtimes: DowntimeRow[];
        defects: DefectRow[];
    };
    operator: {
        /** История ударов ножа (время + причина) */
        machineEvents: { time: string; reason: string }[];
        paramsTable: MachineParamTableRow[];
        /** Если задано — показываем баннер и форму классификации события */
        pendingKnifeStrike: PendingKnifeStrike | null;
        jobInfo: { key: string; value: string }[];
        orderDetails: OrderExecutionOrderDetails;
        defectRegistration: OperatorDefectRegistration;
        defectRemoval: OperatorDefectRemoval;
        downtimes: OperatorDowntimesPanel;
        jb: OperatorJbPanel;
    };
};
