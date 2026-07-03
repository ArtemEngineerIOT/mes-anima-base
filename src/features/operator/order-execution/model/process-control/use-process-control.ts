import { useCallback, useState } from "react";

import {
    PROCESS_CONTROL_CHECKLIST_ROWS,
    PROCESS_CONTROL_INFO_BLOCKS,
    PROCESS_CONTROL_INITIAL_FORM,
} from "./process-control-data";

export function useProcessControl() {
    const [form, setForm] = useState(PROCESS_CONTROL_INITIAL_FORM);

    const setReplacedElementsCount = useCallback((value: string) => {
        setForm((prev) => ({ ...prev, replacedElementsCount: value }));
    }, []);

    const setPressWidth = useCallback((value: string) => {
        setForm((prev) => ({ ...prev, pressWidth: value }));
    }, []);

    const toggleFlag = useCallback((rowId: string) => {
        setForm((prev) => ({
            ...prev,
            flags: {
                ...prev.flags,
                [rowId]: !prev.flags[rowId],
            },
        }));
    }, []);

    return {
        form,
        setReplacedElementsCount,
        setPressWidth,
        toggleFlag,
        checklistRows: PROCESS_CONTROL_CHECKLIST_ROWS,
        infoBlocks: PROCESS_CONTROL_INFO_BLOCKS,
    };
}
