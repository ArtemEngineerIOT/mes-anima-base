import {
    DATA_TABLE_PAGE_SIZE_OPTIONS,
    type DataTablePageSize,
} from "@/shared/ui/kit/styles/data-table-stack";

type DataTablePageSizeFooterProps = {
    totalCount: number;
    showPageSize?: boolean;
    pageSize?: DataTablePageSize;
    onPageSizeChange?: (pageSize: DataTablePageSize) => void;
};

export function DataTablePageSizeFooter({
    totalCount,
    showPageSize = true,
    pageSize,
    onPageSizeChange,
}: DataTablePageSizeFooterProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Всего записей: {totalCount.toLocaleString("ru-RU")}</span>
            {showPageSize && pageSize != null && onPageSizeChange != null && (
                <label className="flex items-center gap-2">
                    <span>Строк на экране</span>
                    <select
                        className="border-input h-8 rounded-sm border bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        value={pageSize}
                        onChange={(event) =>
                            onPageSizeChange(Number(event.target.value) as DataTablePageSize)
                        }
                        aria-label="Количество строк на экране"
                    >
                        {DATA_TABLE_PAGE_SIZE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>
            )}
        </div>
    );
}
