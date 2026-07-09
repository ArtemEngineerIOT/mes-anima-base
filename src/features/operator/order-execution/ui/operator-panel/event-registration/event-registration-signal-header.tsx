import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

import { formatEventCodeHeaderLabel } from "../../../model/event-registration/field-rules";
import type { EventCodeDefinition } from "../../../model/event-registration/types";

type EventRegistrationSignalHeaderProps = {
    signalLabel: string | null;
    eventCode: EventCodeDefinition | null;
};

export function EventRegistrationSignalHeader({
    signalLabel,
    eventCode,
}: EventRegistrationSignalHeaderProps) {
    const signalPart = signalLabel ? signalLabel.toUpperCase() : "—";
    const eventPart = eventCode
        ? formatEventCodeHeaderLabel(eventCode.code, eventCode.label).toUpperCase()
        : null;

    return (
        <div className={cnSectionBlockTitle("break-words")}>
            Сигнал с машины: {signalPart}
            {eventPart ? ` / Событие: ${eventPart}` : null}
        </div>
    );
}
