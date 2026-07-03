export type InformerTone = "success" | "warning" | "alert" | "system" | "normal";

export type InformerToneTokenSet = {
    icon: string;
    filled: string;
    /** Заголовок и иконка при variant=filled (у system светлый фон — не белый текст). */
    filledTitleAndIcon: string;
    /** Описание при variant=filled */
    filledDescription: string;
    bordered: string;
    outline: string;
    pill: string;
    bar: string;
    iconClass: string;
    titleClass: string;
    descClass: string;
};

export const informerToneTokens: Record<InformerTone, InformerToneTokenSet> = {
    success: {
        icon: "check_circle",
        filled: "bg-emerald-500 text-white",
        filledTitleAndIcon: "text-white",
        filledDescription: "text-white/90",
        bordered: "bg-background border shadow-sm",
        outline:
            "bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-50",
        bar: "bg-emerald-500",
        iconClass: "text-emerald-600 dark:text-emerald-300",
        titleClass: "text-emerald-950 dark:text-emerald-50",
        descClass: "text-emerald-900/80 dark:text-emerald-50/80",
        pill: "border bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-50",
    },
    warning: {
        icon: "warning",
        filled: "bg-amber-500 text-white",
        filledTitleAndIcon: "text-white",
        filledDescription: "text-white/90",
        bordered: "bg-background border shadow-sm",
        outline:
            "bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-50",
        bar: "bg-amber-500",
        iconClass: "text-amber-600 dark:text-amber-300",
        titleClass: "text-amber-950 dark:text-amber-50",
        descClass: "text-amber-900/80 dark:text-amber-50/80",
        pill: "border bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-50",
    },
    alert: {
        icon: "error",
        filled: "bg-red-500 text-white",
        filledTitleAndIcon: "text-white",
        filledDescription: "text-white/90",
        bordered: "bg-background border shadow-sm",
        outline: "bg-red-50 border-red-200 text-red-950 dark:bg-red-950/30 dark:border-red-800 dark:text-red-50",
        bar: "bg-red-500",
        iconClass: "text-red-600 dark:text-red-300",
        titleClass: "text-red-950 dark:text-red-50",
        descClass: "text-red-900/80 dark:text-red-50/80",
        pill: "border bg-red-50 border-red-200 text-red-950 dark:bg-red-950/30 dark:border-red-800 dark:text-red-50",
    },
    system: {
        icon: "info",
        filled: "bg-slate-200 text-slate-950 dark:bg-slate-700 dark:text-slate-50",
        filledTitleAndIcon: "text-slate-950 dark:text-slate-50",
        filledDescription: "text-slate-800 dark:text-slate-200",
        bordered: "bg-background border shadow-sm",
        outline:
            "bg-slate-50 border-slate-200 text-slate-950 dark:bg-slate-950/30 dark:border-slate-700 dark:text-slate-50",
        bar: "bg-slate-400 dark:bg-slate-500",
        iconClass: "text-slate-700 dark:text-slate-200",
        titleClass: "text-slate-950 dark:text-slate-100",
        descClass: "text-slate-800 dark:text-slate-200",
        pill: "border bg-slate-50 border-slate-200 text-slate-950 dark:bg-slate-950/30 dark:border-slate-700 dark:text-slate-50",
    },
    normal: {
        icon: "notifications",
        filled: "bg-sky-500 text-white",
        filledTitleAndIcon: "text-white",
        filledDescription: "text-white/90",
        bordered: "bg-background border shadow-sm",
        outline: "bg-sky-50 border-sky-200 text-sky-950 dark:bg-sky-950/30 dark:border-sky-800 dark:text-sky-50",
        bar: "bg-sky-500",
        iconClass: "text-sky-600 dark:text-sky-300",
        titleClass: "text-sky-950 dark:text-sky-50",
        descClass: "text-sky-900/80 dark:text-sky-50/80",
        pill: "border bg-sky-50 border-sky-200 text-sky-950 dark:bg-sky-950/30 dark:border-sky-800 dark:text-sky-50",
    },
};

export function getInformerToneTokens(tone: InformerTone) {
    return informerToneTokens[tone];
}
