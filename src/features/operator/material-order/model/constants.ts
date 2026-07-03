import type { MaterialOrderMachineId, NomenclatureKindId } from "./types";

/** Пока фиксированный код машины заказа (далее — из профиля оператора). */
export const MATERIAL_ORDER_RESOURCE_CODE = "PR120" as const satisfies MaterialOrderMachineId;

export const NOMENCLATURE_KIND_OPTIONS: { id: NomenclatureKindId; label: string }[] = [
    { id: "raw", label: "Сырьё" },
    { id: "semi", label: "Полуфабрикат" },
    { id: "pack", label: "Упаковка" },
];
