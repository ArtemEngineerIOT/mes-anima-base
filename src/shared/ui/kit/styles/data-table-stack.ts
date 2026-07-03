import type { CSSProperties } from "react";

import { cn } from "@/shared/lib/css";

import { sectionBlockTitleClassName } from "./section-block-title";

/** Число строк тела таблицы без вертикального скролла (по умолчанию для всего проекта). */
export const DATA_TABLE_VISIBLE_BODY_ROW_COUNT = 10;

/**
 * Базовая оболочка `Table`: ширина, обрезка, скругление, рамка, фон.
 * Доп. ограничения (`min-w-*`, `text-[12px]` на всю таблицу и т. п.) — через `cnDataTableShell(...)`.
 * См. `.cursor/rules/table-uikit.mdc`.
 */
export const dataTableShellClassName = "w-full overflow-hidden rounded-sm border bg-background";

/**
 * Обёртка вокруг `Table`: до {@link DATA_TABLE_VISIBLE_BODY_ROW_COUNT} строк тела видно без скролла,
 * шапка липкая (`dataTableStickyHeadCellClassName`). Горизонтальный скролл — при нехватке ширины.
 * Высота задаётся CSS-переменными в `index.css` (`--data-table-visible-body-rows` и др.).
 */
export const dataTableScrollViewportClassName =
    "data-table-scroll-viewport app-scroll min-w-0 max-w-full overflow-auto";

/**
 * Ячейка шапки: те же размер/начертание, что у заголовка блока (`section-block-title`), + отступы ячейки.
 * Эталон использования: `material-order-form-panel.tsx`.
 */
export const dataTableHeadCellClassName = cn(sectionBlockTitleClassName, "h-auto px-3 py-2");

/**
 * Ячейка шапки внутри {@link dataTableScrollViewportClassName}: липкая при вертикальном скролле.
 */
export const dataTableStickyHeadCellClassName = cn(
    dataTableHeadCellClassName,
    "sticky top-0 z-10 bg-muted/40 shadow-[inset_0_-1px_0_var(--border)]",
);

/**
 * Липкая шапка на фоне `bg-background` (вложенные таблицы без рамки, `border-0`).
 */
export const dataTableStickyHeadCellOnBackgroundClassName = cn(
    dataTableHeadCellClassName,
    "sticky top-0 z-10 bg-background shadow-[inset_0_-1px_0_var(--border)]",
);

/**
 * Ячейка тела: отступы, начертание, размер и цвет текста по умолчанию.
 */
export const dataTableBodyCellClassName =
    "px-3 py-2 font-normal text-sm text-foreground align-middle";

export function cnDataTableShell(...classes: (string | undefined | false)[]): string {
    return cn(dataTableShellClassName, ...classes);
}

export function cnDataTableScrollViewport(...classes: (string | undefined | false)[]): string {
    return cn(dataTableScrollViewportClassName, ...classes);
}

export function dataTableScrollViewportStyle(
    visibleBodyRows?: number,
): CSSProperties | undefined {
    if (visibleBodyRows == null) {
        return undefined;
    }

    return {
        ["--data-table-visible-body-rows" as string]: String(visibleBodyRows),
    };
}

export function cnDataTableHeadCell(...classes: (string | undefined | false)[]): string {
    return cn(dataTableHeadCellClassName, ...classes);
}

export function cnDataTableStickyHeadCell(...classes: (string | undefined | false)[]): string {
    return cn(dataTableStickyHeadCellClassName, ...classes);
}

export function cnDataTableBodyCell(...classes: (string | undefined | false)[]): string {
    return cn(dataTableBodyCellClassName, ...classes);
}
