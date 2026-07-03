import type { InformerPillVariant } from "@/shared/ui/kit/informer-pill";
import type { InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";
import type { MonitoringStat } from "./types";

export function monitoringStatToInformerTone(tone: NonNullable<MonitoringStat["tone"]>): InformerTone {
    const map: Record<NonNullable<MonitoringStat["tone"]>, InformerTone> = {
        good: "success",
        neutral: "system",
        bad: "alert",
    };
    return map[tone];
}

export function monitoringStatPillVariant(tone?: MonitoringStat["tone"]): InformerPillVariant {
    return tone === "neutral" || tone === undefined ? "outline" : "filled";
}
