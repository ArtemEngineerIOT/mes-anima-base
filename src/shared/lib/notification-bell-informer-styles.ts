import type { NotificationBellTone } from "@/shared/model/system-notifications";
import { informerToneTokens, type InformerTone } from "@/shared/ui/kit/styles/informer-tone-tokens";

/** Соответствие тона индикатора колокольчика тонам Informer (цвета из `informerToneTokens`). */
function bellToneToInformerTone(tone: NotificationBellTone): InformerTone | null {
    switch (tone) {
        case "none":
            return null;
        case "info":
            return "system";
        case "warning":
            return "warning";
        case "alert":
            return "alert";
        default:
            return null;
    }
}

/** Классы иконки и бейджа в палитре Informer (`filled` для кружка счётчика, `iconClass` для колокольчика). */
export function getNotificationBellInformerClasses(tone: NotificationBellTone): {
    iconClass: string;
    badgeClass: string | null;
} {
    const informerTone = bellToneToInformerTone(tone);
    if (!informerTone) {
        return { iconClass: "text-muted-foreground", badgeClass: null };
    }
    const tokens = informerToneTokens[informerTone];
    return {
        iconClass: tokens.iconClass,
        badgeClass: tokens.filled,
    };
}
