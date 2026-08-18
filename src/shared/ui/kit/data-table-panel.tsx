import type { ReactNode } from "react";

import { cn } from "@/shared/lib/css";
import {
    dataTablePanelFooterClassName,
    dataTablePanelScrollClassName,
    dataTablePanelShellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";

type DataTablePanelProps = {
    children: ReactNode;
    /** Пагинация и т. п. Нет пропа — таблица без футера. */
    footer?: ReactNode;
    className?: string;
};

/**
 * Таблица без внутреннего вертикального скролла: шапка и тело едут вместе с панелью.
 * Параллельно {@link DataTableViewport} (фиксированная высота, скролл только у tbody).
 *
 * На `Table` — `dataTablePanelTableClassName` (+ `min-w-[…]` по макету).
 * На `TableHead` — `dataTablePanelHeadCellClassName`.
 */
export function DataTablePanel({ children, footer, className }: DataTablePanelProps) {
    return (
        <div className={cn(dataTablePanelShellClassName, className)}>
            <div className={dataTablePanelScrollClassName}>{children}</div>
            {footer != null ? <div className={dataTablePanelFooterClassName}>{footer}</div> : null}
        </div>
    );
}
