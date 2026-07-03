import type { InformerPillVariant } from "@/shared/ui/kit/informer-pill";
import type { InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";

import type { StageStatus } from "./types";

export type { StageStatus } from "./types";

export function statusLabel(s: StageStatus): string {
    switch (s) {
        case "planned":
            return "План";
        case "in_progress":
            return "В работе";
        case "paused":
            return "Приостановлен";
        case "done":
            return "Завершён";
        case "cancelled":
            return "Отменён";
    }
}

export function stageStatusInformerTone(s: StageStatus): InformerTone {
    switch (s) {
        case "planned":
            return "system";
        case "in_progress":
            return "normal";
        case "paused":
            return "warning";
        case "done":
            return "success";
        case "cancelled":
            return "alert";
    }
}

export function stageStatusInformerVariant(s: StageStatus): InformerPillVariant {
    return s === "in_progress" ? "filled" : "outline";
}
