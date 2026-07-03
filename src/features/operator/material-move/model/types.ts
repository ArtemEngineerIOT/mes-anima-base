/** Вид номенклатуры (как в заказе материалов). */
export type MaterialMoveKindId = "raw" | "semi" | "pack";

/** Склад / локация-отправитель или приёмник (мок). */
export type MaterialMoveWarehouseId = "w100" | "w200" | "w300" | "m-pr110";

export type MaterialMoveTableRow = {
    id: string;
    nomenclature: string;
    purpose: string;
    series: string;
    /** Запрошенное количество (редактируется). */
    requestedQty: number;
};
