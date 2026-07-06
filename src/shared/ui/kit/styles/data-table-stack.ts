import type { CSSProperties } from "react";

import { cn } from "@/shared/lib/css";

import { sectionBlockTitleClassName } from "./section-block-title";

/** Число строк тела таблицы без вертикального скролла (по умолчанию для всего проекта). */
export const DATA_TABLE_VISIBLE_BODY_ROW_COUNT = 25;

/** Варианты числа строк на странице таблицы. */
export const DATA_TABLE_PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;

export type DataTablePageSize = (typeof DATA_TABLE_PAGE_SIZE_OPTIONS)[number];

/**
 * Базовая оболочка `Table`: ширина, обрезка, скругление, рамка, фон.
 * Доп. ограничения (`min-w-*`, `text-[12px]` на всю таблицу и т. п.) — через `cnDataTableShell(...)`.
 * См. `.cursor/rules/table-uikit.mdc`.
 */
export const dataTableShellClassName = "w-full overflow-hidden rounded-sm border bg-background";

/**
 * `Table` внутри {@link DataTableViewport}: без `overflow-hidden` и внешней рамки
 * (рамку задаёт оболочка viewport).
 */
export const dataTableInsetShellClassName = "w-full border-0 bg-transparent";

/**
 * Обёртка вокруг `Table`: до {@link DATA_TABLE_VISIBLE_BODY_ROW_COUNT} строк тела видно без скролла,
 * шапка липкая (`dataTableStickyHeadCellClassName`). Горизонтальный скролл — при нехватке ширины.
 * Высота задаётся CSS-переменными в `index.css` (`--data-table-visible-body-rows` и др.).
 */
export const dataTableScrollViewportClassName =
    "data-table-scroll-viewport app-scroll min-w-0 max-w-full overflow-auto";

/** Модификатор legacy-viewport с футером: в max-height учитывается высота футера. */
export const dataTableScrollViewportWithFooterClassName = "data-table-scroll-viewport--with-footer";

/** Оболочка {@link DataTableViewport}: рамка, скругление, колоночный flex. */
export const dataTableViewportShellClassName =
    "data-table-viewport-shell flex min-w-0 max-w-full flex-col overflow-hidden rounded-sm border bg-background";

/** Модификатор shell с футером (только {@link DataTableViewportLayoutFixed}). */
export const dataTableViewportShellWithFooterClassName = "data-table-viewport-shell--with-footer";

/** Фиксированная высота по числу строк тела (модалки, вложенные блоки). */
export const dataTableViewportShellFixedClassName = "data-table-viewport-shell--fixed";

/** Заполняет свободное место flex-родителя (`flex-1 min-h-0`). */
export const dataTableViewportShellFillClassName = "data-table-viewport-shell--fill flex-1 min-h-0";

export type DataTableViewportLayout = "fixed" | "fill";

/**
 * Область таблицы: вертикальный скролл у `tbody`, горизонтальный — при нехватке ширины (один слой).
 * См. `index.css` (`.data-table-split-scroll`).
 */
export const dataTableSplitScrollClassName = "data-table-split-scroll min-w-0";

/** Добавить на `TableBody` внутри {@link DataTableViewport} для кастомного скроллбара. */
export const dataTableSplitScrollBodyClassName = "app-scroll";

/** Панель футера под таблицей внутри {@link DataTableViewport}. */
export const dataTableViewportFooterClassName =
    "data-table-viewport-footer shrink-0 bg-muted/40 px-3 py-2 shadow-[inset_0_1px_0_var(--border)]";

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
 * Ячейка футера внутри {@link dataTableScrollViewportClassName}: липкая при вертикальном скролле.
 */
export const dataTableStickyFootCellClassName = cn(
    "sticky bottom-0 z-10 bg-muted/40 px-3 py-2 shadow-[inset_0_1px_0_var(--border)]",
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

type DataTableViewportShellOptions = {
    withFooter?: boolean;
    layout?: DataTableViewportLayout;
    className?: string;
};

export function cnDataTableViewportShell({
    withFooter = false,
    layout = "fixed",
    className,
}: DataTableViewportShellOptions = {}): string {
    return cn(
        dataTableViewportShellClassName,
        layout === "fill"
            ? dataTableViewportShellFillClassName
            : dataTableViewportShellFixedClassName,
        withFooter && layout === "fixed" && dataTableViewportShellWithFooterClassName,
        className,
    );
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
