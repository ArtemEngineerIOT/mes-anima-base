import { useEffect, useMemo, useState } from "react";

import {
    DATA_TABLE_VISIBLE_BODY_ROW_COUNT,
    type DataTablePageSize,
} from "@/shared/ui/kit/styles/data-table-stack";

export type DataTablePaginationState = {
    page: number;
    pageSize: DataTablePageSize;
    totalCount: number;
    totalPages: number;
    rangeStart: number;
    rangeEnd: number;
};

export function getDataTableTotalPages(totalCount: number, pageSize: number): number {
    if (totalCount <= 0) {
        return 1;
    }

    return Math.ceil(totalCount / pageSize);
}

export function clampDataTablePage(page: number, totalPages: number): number {
    return Math.min(Math.max(1, page), totalPages);
}

export function getDataTablePaginationState(
    totalCount: number,
    page: number,
    pageSize: number,
): DataTablePaginationState {
    const totalPages = getDataTableTotalPages(totalCount, pageSize);
    const safePage = clampDataTablePage(page, totalPages);
    const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const rangeEnd = Math.min(safePage * pageSize, totalCount);

    return {
        page: safePage,
        pageSize: pageSize as DataTablePageSize,
        totalCount,
        totalPages,
        rangeStart,
        rangeEnd,
    };
}

export function paginateDataTableItems<T>(
    items: readonly T[],
    page: number,
    pageSize: number,
): { pageItems: T[]; pagination: DataTablePaginationState } {
    const pagination = getDataTablePaginationState(items.length, page, pageSize);
    const startIndex = pagination.rangeStart === 0 ? 0 : pagination.rangeStart - 1;
    const pageItems = items.slice(startIndex, startIndex + pageSize);

    return { pageItems, pagination };
}

type UseDataTablePaginationOptions = {
    initialPageSize?: DataTablePageSize;
};

export function useDataTablePagination<T>(
    items: readonly T[],
    { initialPageSize = DATA_TABLE_VISIBLE_BODY_ROW_COUNT }: UseDataTablePaginationOptions = {},
) {
    const [pageSize, setPageSize] = useState<DataTablePageSize>(initialPageSize);
    const [page, setPage] = useState(1);

    const totalCount = items.length;
    const totalPages = getDataTableTotalPages(totalCount, pageSize);

    useEffect(() => {
        setPage((currentPage) => clampDataTablePage(currentPage, totalPages));
    }, [totalPages]);

    const pagination = useMemo(
        () => getDataTablePaginationState(totalCount, page, pageSize),
        [page, pageSize, totalCount],
    );

    const { pageItems } = useMemo(
        () => paginateDataTableItems(items, pagination.page, pageSize),
        [items, pagination.page, pageSize],
    );

    const handlePageSizeChange = (nextPageSize: DataTablePageSize) => {
        setPageSize(nextPageSize);
        setPage(1);
    };

    return {
        pageItems,
        pagination,
        pageSize,
        setPageSize: handlePageSizeChange,
        setPage,
        goToNextPage: () => setPage((currentPage) => clampDataTablePage(currentPage + 1, totalPages)),
        goToPrevPage: () => setPage((currentPage) => clampDataTablePage(currentPage - 1, totalPages)),
    };
}
