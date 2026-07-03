import type { ApiSchemas } from "@/shared/api/schema";

/** Узел дерева ответа бэка (рекурсивный `table`). */
export type ServerDataRow = ApiSchemas["ServerDataRow"];

/** Корневой массив ответа RPC — основной формат данных с бэка. */
export type ServerDataPayload = ApiSchemas["ServerDataPayload"];

export type WalkServerDataRowCtx = {
    row: ServerDataRow;
    /** 0 — корневой массив, 1+ — внутри `table`. */
    depth: number;
    parent: ServerDataRow | null;
    indexInParent: number;
};

/**
 * Обход дерева в глубину: сначала каждый элемент текущего списка, затем рекурсивно его `table`.
 * Верните `false` из `visit`, чтобы остановить обход.
 */
export function walkServerDataRowsDepthFirst(
    rows: ServerDataPayload,
    visit: (ctx: WalkServerDataRowCtx) => void | false,
): void {
    const walkList = (list: ServerDataRow[], depth: number, parent: ServerDataRow | null) => {
        for (let i = 0; i < list.length; i++) {
            const row = list[i]!;
            if (visit({ row, depth, parent, indexInParent: i }) === false) {
                return;
            }
            const nested = row.table;
            if (Array.isArray(nested) && nested.length > 0) {
                walkList(nested, depth + 1, row);
            }
        }
    };
    walkList(rows, 0, null);
}

/** Дочерние строки `table` или пустой массив. */
export function getServerDataTableRows(row: ServerDataRow): ServerDataRow[] {
    const t = row.table;
    return Array.isArray(t) ? t : [];
}
