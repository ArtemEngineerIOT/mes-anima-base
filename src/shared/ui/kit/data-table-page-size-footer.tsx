import {
    DATA_TABLE_PAGE_SIZE_OPTIONS,
    dataTableFooterSelectClassName,
    dataTableFooterTextClassName,
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
        <div className={`flex flex-wrap items-center justify-between gap-2 ${dataTableFooterTextClassName}`}>
            <span>Всего: {totalCount.toLocaleString("ru-RU")}</span>
            {showPageSize && pageSize != null && onPageSizeChange != null && (
                <label className="flex items-center gap-1.5">
                    <span>Строк:</span>
                    <select
                        className={dataTableFooterSelectClassName}
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
