/** Строка «Список цилиндров» в таблице JB (мок и BFF). */
export const JB_CYLINDER_LIST_ROW_ID = "cylinder-list";

/** Строка «Информация по этапу» в таблице JB (мок и BFF). */
export const JB_STAGE_INFO_ROW_ID = "stage-info";

/** Строка «Карта технологических параметров печати» в таблице JB (мок и BFF). */
export const JB_PRINT_PARAMS_MAP_ROW_ID = "print-params-map";

/** Строка «Карта контроля цвета» в таблице JB (мок и BFF). */
export const JB_COLOR_CONTROL_MAP_ROW_ID = "color-control-map";

/** Строка «Рецептура красок» в таблице JB (мок и BFF). */
export const JB_INK_RECIPE_ROW_ID = "ink-recipe";

/** Строка «Этикетка на секцию» в таблице JB (мок и BFF). */
export const JB_SECTION_LABEL_ROW_ID = "section-label";

/** Строка «Process control» в таблице JB (мок и BFF). */
export const JB_PROCESS_CONTROL_ROW_ID = "process-control";

/** Строка «Весь документ» / JB Summary в таблице JB (мок и BFF). */
export const JB_WHOLE_DOCUMENT_ROW_ID = "jb-whole";

/** Соответствие `id` из getJbTable → id строки UI / печати. */
export const JB_TABLE_NUMERIC_ID_TO_ROW_ID: Record<number, string> = {
    1: JB_STAGE_INFO_ROW_ID,
    2: JB_CYLINDER_LIST_ROW_ID,
    3: JB_PRINT_PARAMS_MAP_ROW_ID,
    4: JB_INK_RECIPE_ROW_ID,
    5: JB_SECTION_LABEL_ROW_ID,
    6: JB_PROCESS_CONTROL_ROW_ID,
    7: JB_COLOR_CONTROL_MAP_ROW_ID,
    8: JB_WHOLE_DOCUMENT_ROW_ID,
};
