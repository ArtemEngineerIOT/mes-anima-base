import type { CSSProperties, ReactNode } from "react";

import {
    cnDataTableViewportShell,
    DATA_TABLE_VISIBLE_BODY_ROW_COUNT,
    dataTableScrollViewportStyle,
    dataTableSplitScrollClassName,
    dataTableViewportFooterClassName,
    type DataTableViewportLayout,
} from "@/shared/ui/kit/styles/data-table-stack";

type DataTableViewportProps = {
    children: ReactNode;
    /** Нет пропа — таблица без футера (как раньше). */
    footer?: ReactNode;
    /**
     * `fixed` — высота по `visibleBodyRows` (модалки, карточки).
     * `fill` — занимает `flex-1` родителя, tbody растягивается на оставшееся место.
     */
    layout?: DataTableViewportLayout;
    /** Только для `layout="fixed"`. */
    visibleBodyRows?: number;
    className?: string;
    style?: CSSProperties;
};

/**
 * Оболочка таблицы: шапка и футер (если передан) фиксированы, вертикальный скролл только у `tbody`.
 * На `Table` — `dataTableInsetShellClassName`; на `TableBody` — `dataTableSplitScrollBodyClassName`.
 */
export function DataTableViewport({
    children,
    footer,
    layout = "fixed",
    visibleBodyRows = DATA_TABLE_VISIBLE_BODY_ROW_COUNT,
    className,
    style,
}: DataTableViewportProps) {
    const hasFooter = footer != null;
    const isFixedLayout = layout === "fixed";

    return (
        <div
            className={cnDataTableViewportShell({
                withFooter: hasFooter,
                layout,
                className,
            })}
            style={{
                ...(isFixedLayout ? dataTableScrollViewportStyle(visibleBodyRows) : undefined),
                ...style,
            }}
        >
            <div className={dataTableSplitScrollClassName}>{children}</div>
            {hasFooter && <div className={dataTableViewportFooterClassName}>{footer}</div>}
        </div>
    );
}
