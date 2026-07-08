import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

export function EventRegistrationSignalHeader({ signalLabel }: { signalLabel: string | null }) {
    return (
        <div className={cnSectionBlockTitle()}>
            Сигнал с машины: {signalLabel ? signalLabel.toUpperCase() : "—"}
        </div>
    );
}
