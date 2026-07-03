import { cn } from "@/shared/lib/css";

/**
 * Подпись поля над выпадающим выбором: `MultiSelectCombobox`, другие комбобоксы kit, нативный `<select>`.
 * Inter 12px / 400 / line-height 150%. См. `.cursor/rules/combobox-field-labels.mdc`.
 */
export const comboboxFieldLabelClassName =
    "font-sans text-[12px] font-normal leading-[1.5] tracking-normal text-muted-foreground align-middle";

export function cnComboboxFieldLabel(...classes: (string | undefined | false)[]): string {
    return cn(comboboxFieldLabelClassName, ...classes);
}
