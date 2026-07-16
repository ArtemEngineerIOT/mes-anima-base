import type { InformerTone } from "@/shared/ui/kit/informer";

import type { ReleaseProductionEventSnapshot } from "./production-event-types";

export type ReleaseProductionEventInformer = {
    tone: InformerTone;
    title: string;
    description: string;
};

export function resolveReleaseProductionEventInformer(
    snapshot: ReleaseProductionEventSnapshot,
): ReleaseProductionEventInformer {
    const currentEvent = snapshot.currentEvent;

    if (currentEvent) {
        const titleParts = [currentEvent.eventCodeLabel, currentEvent.eventAt].filter(Boolean);
        return {
            tone: "warning",
            title: titleParts.join(" · ") || snapshot.plateTitle,
            description:
                currentEvent.informerDetail ||
                "Обработайте событие с машины перед ручным выпуском.",
        };
    }

    if (snapshot.emptyStateMessage) {
        return {
            tone: "success",
            title: snapshot.plateTitle,
            description: snapshot.emptyStateMessage,
        };
    }

    return {
        tone: "success",
        title: snapshot.plateTitle,
        description: "Событий с машины нет",
    };
}
