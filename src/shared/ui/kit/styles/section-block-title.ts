import { cn } from "@/shared/lib/css";

/**
 * Заголовки блоков экрана (карточки, секции) и видимых заголовков модальных окон:
 * Inter через `font-sans`, 12px, 700, uppercase, line-height 140%, letter-spacing normal.
 * См. `.cursor/rules/section-block-titles.mdc`.
 */
export const sectionBlockTitleClassName =
    "font-sans text-[12px] font-bold uppercase leading-[1.4] tracking-normal text-foreground align-middle";

export function cnSectionBlockTitle(...classes: (string | undefined | false)[]): string {
    return cn(sectionBlockTitleClassName, ...classes);
}
