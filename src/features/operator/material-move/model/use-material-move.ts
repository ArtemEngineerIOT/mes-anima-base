import { useCallback, useState } from "react";

import {
    MATERIAL_MOVE_DEST_WAREHOUSE_OPTIONS,
    MATERIAL_MOVE_KIND_OPTIONS,
    MATERIAL_MOVE_SOURCE_WAREHOUSE_OPTIONS,
} from "./constants";
import { MOCK_MATERIAL_MOVE_ROWS } from "./material-move-mock";
import type { MaterialMoveKindId, MaterialMoveTableRow, MaterialMoveWarehouseId } from "./types";

function cloneRows(rows: MaterialMoveTableRow[]): MaterialMoveTableRow[] {
    return rows.map((r) => ({ ...r }));
}

const defaultKinds: MaterialMoveKindId[] = MATERIAL_MOVE_KIND_OPTIONS.map((k) => k.id);

export function useMaterialMove() {
    const [selectedKinds, setSelectedKinds] = useState<MaterialMoveKindId[]>(defaultKinds);
    const [sourceWarehouse, setSourceWarehouse] = useState<MaterialMoveWarehouseId>("w100");
    const [destWarehouse, setDestWarehouse] = useState<MaterialMoveWarehouseId>("w200");
    const [rows, setRows] = useState<MaterialMoveTableRow[]>(() => cloneRows(MOCK_MATERIAL_MOVE_ROWS));
    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(["m1"]));
    const [byTime, setByTime] = useState("");
    const [warehouseComment, setWarehouseComment] = useState("");

    /** Демо: предупреждение по частичной доступности (аналог UC-12 / макет). */
    const showSourceAvailabilityWarning = true;

    const toggleKind = useCallback((id: MaterialMoveKindId) => {
        setSelectedKinds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].sort(byKindOrder),
        );
    }, []);

    const clearKinds = useCallback(() => {
        setSelectedKinds([]);
    }, []);

    const toggleRow = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const setRowQty = useCallback((id: string, qty: number) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, requestedQty: qty } : r)));
    }, []);

    const resetForm = useCallback(() => {
        setRows(cloneRows(MOCK_MATERIAL_MOVE_ROWS));
        setSelectedIds(new Set());
        setByTime("");
        setWarehouseComment("");
    }, []);

    const submitRequest = useCallback(() => {
        // Макет: сюда уйдёт вызов API / 1С (UC-22 п. 7).
        void selectedIds;
        void byTime;
        void warehouseComment;
        void sourceWarehouse;
        void destWarehouse;
    }, [byTime, destWarehouse, selectedIds, sourceWarehouse, warehouseComment]);

    return {
        kindOptions: MATERIAL_MOVE_KIND_OPTIONS,
        sourceWarehouseOptions: MATERIAL_MOVE_SOURCE_WAREHOUSE_OPTIONS,
        destWarehouseOptions: MATERIAL_MOVE_DEST_WAREHOUSE_OPTIONS,
        selectedKinds,
        toggleKind,
        clearKinds,
        sourceWarehouse,
        setSourceWarehouse,
        destWarehouse,
        setDestWarehouse,
        rows,
        selectedIds,
        toggleRow,
        setRowQty,
        byTime,
        setByTime,
        warehouseComment,
        setWarehouseComment,
        showSourceAvailabilityWarning,
        resetForm,
        submitRequest,
    };
}

function byKindOrder(a: MaterialMoveKindId, b: MaterialMoveKindId) {
    return (
        MATERIAL_MOVE_KIND_OPTIONS.findIndex((k) => k.id === a) -
        MATERIAL_MOVE_KIND_OPTIONS.findIndex((k) => k.id === b)
    );
}

export type MaterialMoveModel = ReturnType<typeof useMaterialMove>;
