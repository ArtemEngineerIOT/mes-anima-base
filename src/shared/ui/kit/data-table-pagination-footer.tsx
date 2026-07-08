import { Button } from "@/shared/ui/kit/button";
import { Icon } from "@/shared/ui/kit/icon";
import {
    DATA_TABLE_PAGE_SIZE_OPTIONS,
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

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
                {totalCount === 0
                    ? "Показано 0 из 0"
                    : `Показано ${rangeStart.toLocaleString("ru-RU")}–${rangeEnd.toLocaleString("ru-RU")} из ${totalCount.toLocaleString("ru-RU")}`}
            </span>

            <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2">
                    <span>Строк на странице</span>
                    <select
                        className="border-input h-8 rounded-sm border bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={!canGoPrev}
                        onClick={() => onPageChange(page - 1)}
                        aria-label="Предыдущая страница"
                    >
                        <Icon name="chevron_left" className="text-base" />
                    </Button>
                    <span className="min-w-[7.5rem] text-center">
                        Страница {page} из {totalPages}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={!canGoNext}
                        onClick={() => onPageChange(page + 1)}
                        aria-label="Следующая страница"
                    >
                        <Icon name="chevron_right" className="text-base" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
