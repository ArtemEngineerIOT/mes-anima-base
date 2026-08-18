import { useState, type Dispatch, type SetStateAction } from "react";

/**
 * Выставляет `isLoading = enabled` в том же рендере, где `enabled` переключился.
 * Иначе первый кадр после раскрытия блока показывает пустые таблицы/форму.
 */
export function useSyncLoadingOnEnable(
    enabled: boolean,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
): void {
    const [prevEnabled, setPrevEnabled] = useState(enabled);

    if (enabled !== prevEnabled) {
        setPrevEnabled(enabled);
        setIsLoading(enabled);
    }
}
