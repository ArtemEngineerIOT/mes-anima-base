import { useCallback } from "react";

import { useEventRegistrationContext } from "../../model/event-registration/event-registration-context";
import { useUnprocessedSignalsSummary } from "../../model/event-registration/unprocessed-signals-summary/use-unprocessed-signals-summary";
import { Informer } from "@/shared/ui/kit/informer";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { EventRegistrationSignalHeader } from "./event-registration/event-registration-signal-header";
import { EventRegistrationSignalsSummaryPanel } from "./event-registration/event-registration-signals-summary-panel";
import { EventRegistrationStepper } from "./event-registration/event-registration-stepper";
import {
    EventRegistrationStep1,
    EventRegistrationStep2,
    EventRegistrationStep3,
} from "./event-registration/event-registration-steps";
import { EventRegistrationUnprocessedPanel } from "./event-registration/event-registration-unprocessed-panel";

type OrderExecutionEventRegistrationSectionProps = {
    workAreaId?: string;
    signalsSummaryEnabled: boolean;
    onExpandedChange?: (expanded: boolean) => void;
};

export function OrderExecutionEventRegistrationSection({
    workAreaId,
    signalsSummaryEnabled,
    onExpandedChange,
}: OrderExecutionEventRegistrationSectionProps) {
    const registration = useEventRegistrationContext();
    const {
        step,
        unprocessedCount,
        selectedUnprocessed,
        selectedCode,
        goToStep,
        goNext,
        goBack,
        registerEvent,
        loadError,
        isWizardDisabled,
    } = registration;

    const {
        snapshot: signalsSummary,
        isLoading: isSignalsSummaryLoading,
        error: signalsSummaryError,
        reload: reloadSignalsSummary,
    } = useUnprocessedSignalsSummary({
        workAreaId,
        enabled: signalsSummaryEnabled,
    });

    const handleExpandedChange = useCallback(
        (expanded: boolean) => {
            onExpandedChange?.(expanded);
            if (expanded) {
                void reloadSignalsSummary();
            }
        },
        [onExpandedChange, reloadSignalsSummary],
    );

    const headerCount = signalsSummary.totalCount > 0 ? signalsSummary.totalCount : unprocessedCount;
    const headerTone = headerCount > 0 ? "warning" : undefined;

    return (
        <OrderExecutionCollapsibleSection
            title="Регистрация события"
            defaultOpen={false}
            tone={headerTone}
            count={headerCount > 0 ? headerCount : undefined}
            keepMounted
            onExpandedChange={handleExpandedChange}
        >
            <div className="grid gap-4">
                {loadError ? (
                    <Informer tone="alert" variant="bordered" size="s" title="Ошибка загрузки" description={loadError} />
                ) : null}

                <EventRegistrationSignalsSummaryPanel
                    snapshot={signalsSummary}
                    isLoading={isSignalsSummaryLoading}
                    error={signalsSummaryError}
                />

                <EventRegistrationUnprocessedPanel registration={registration} disabled={isWizardDisabled} />

                <div className="grid gap-4 border-t border-border pt-4">
                    <EventRegistrationSignalHeader
                        signalLabel={selectedUnprocessed?.description ?? null}
                        eventCode={selectedCode}
                    />

                    <EventRegistrationStepper
                        currentStep={step}
                        onStepClick={goToStep}
                        disabled={isWizardDisabled}
                    />

                    {step === 1 ? (
                        <EventRegistrationStep1
                            registration={registration}
                            onNext={goNext}
                            disabled={isWizardDisabled}
                        />
                    ) : null}
                    {step === 2 ? (
                        <EventRegistrationStep2
                            registration={registration}
                            onBack={goBack}
                            onNext={goNext}
                            disabled={isWizardDisabled}
                        />
                    ) : null}
                    {step === 3 ? (
                        <EventRegistrationStep3
                            registration={registration}
                            onBack={goBack}
                            onRegister={() => void registerEvent()}
                            disabled={isWizardDisabled}
                        />
                    ) : null}
                </div>
            </div>
        </OrderExecutionCollapsibleSection>
    );
}
