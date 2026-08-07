import { Button } from "@/shared/ui/kit/button";
import { Icon } from "@/shared/ui/kit/icon";
import {
    DATA_TABLE_PAGE_SIZE_OPTIONS,
    dataTableFooterSelectClassName,
    dataTableFooterTextClassName,
    type DataTablePageSize,
} from "@/shared/ui/kit/styles/data-table-stack";

type DataTablePaginationFooterProps = {
    totalCount: number;
    rangeStart: number;
    rangeEnd: number;
    page: number;
    totalPages: number;
    pageSize: DataTablePageSize;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: DataTablePageSize) => void;
};

export function DataTablePaginationFooter({
    totalCount,
    rangeStart,
    rangeEnd,
    page,
    totalPages,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: DataTablePaginationFooterProps) {
    const canGoPrev = page > 1;
    const canGoNext = page < totalPages;

    const rangeLabel =
        totalCount === 0
            ? "0 из 0"
            : `${rangeStart.toLocaleString("ru-RU")}–${rangeEnd.toLocaleString("ru-RU")} из ${totalCount.toLocaleString("ru-RU")}`;

    return (
        <div className={`flex flex-wrap items-center justify-between gap-2 ${dataTableFooterTextClassName}`}>
            <span>{rangeLabel}</span>

            <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5">
                    <span>Строк:</span>
                    <select
                        className={dataTableFooterSelectClassName}
                        value={pageSize}
                        onChange={(event) =>
                            onPageSizeChange(Number(event.target.value) as DataTablePageSize)
                        }
                        aria-label="Количество строк на странице"
                    >
                        {DATA_TABLE_PAGE_SIZE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="flex items-center gap-0.5">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="size-7"
                        disabled={!canGoPrev}
                        onClick={() => onPageChange(page - 1)}
                        aria-label="Предыдущая страница"
                    >
                        <Icon name="chevron_left" className="text-sm" />
                    </Button>
                    <span className="min-w-12 px-1 text-center tabular-nums">
                        {page} / {totalPages}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="size-7"
                        disabled={!canGoNext}
                        onClick={() => onPageChange(page + 1)}
                        aria-label="Следующая страница"
                    >
                        <Icon name="chevron_right" className="text-sm" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
