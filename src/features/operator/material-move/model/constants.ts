import type { MaterialMoveKindId, MaterialMoveWarehouseId } from "./types";

export const MATERIAL_MOVE_KIND_OPTIONS: { id: MaterialMoveKindId; label: string }[] = [
    { id: "raw", label: "Сырьё" },
    { id: "semi", label: "Полуфабрикат" },
    { id: "pack", label: "Упаковка" },
];

export const MATERIAL_MOVE_SOURCE_WAREHOUSE_OPTIONS: { id: MaterialMoveWarehouseId; label: string }[] = [
    { id: "w100", label: "Склад 100" },
    { id: "w300", label: "Склад 300" },
    { id: "m-pr110", label: "Машина PR110" },
];

export const MATERIAL_MOVE_DEST_WAREHOUSE_OPTIONS: { id: MaterialMoveWarehouseId; label: string }[] = [
    { id: "w100", label: "Склад 100" },
    { id: "w200", label: "Склад 200" },
    { id: "w300", label: "Склад 300" },
    { id: "m-pr110", label: "Машина PR110" },
];
