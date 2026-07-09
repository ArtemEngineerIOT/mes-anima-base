import { useEventRegistrationContext } from "../../model/event-registration/event-registration-context";
import { useOrderExecutionMachineStompState } from "../../model/machine-stomp/order-execution-machine-stomp-context";
import { resolveEventRegistrationMachinePanel } from "../../model/machine-stomp/resolve-event-registration-machine-panel";
import { Informer } from "@/shared/ui/kit/informer";
import { MachineDataPanel } from "@/shared/ui/kit/machine-data-panel";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { EventRegistrationSignalHeader } from "./event-registration/event-registration-signal-header";
import { EventRegistrationStepper } from "./event-registration/event-registration-stepper";
import {
    EventRegistrationStep1,
    EventRegistrationStep2,
    EventRegistrationStep3,
} from "./event-registration/event-registration-steps";
import { EventRegistrationUnprocessedPanel } from "./event-registration/event-registration-unprocessed-panel";

type OrderExecutionEventRegistrationSectionProps = {
    onExpandedChange?: (expanded: boolean) => void;
};

export function OrderExecutionEventRegistrationSection({
    onExpandedChange,
}: OrderExecutionEventRegistrationSectionProps) {
    const registration = useEventRegistrationContext();
    const machineStompState = useOrderExecutionMachineStompState();
    const machineDataPanel = resolveEventRegistrationMachinePanel(machineStompState);
    const {
        step,
        unprocessedCount,
        selectedUnprocessed,
        selectedCode,
        goToStep,
        goNext,
        goBack,
        registerEvent,
        isLoading,
        loadError,
        isWizardDisabled,
    } = registration;

    const headerTone = unprocessedCount > 0 ? "warning" : undefined;

    return (
        <OrderExecutionCollapsibleSection
            title="Регистрация события"
            defaultOpen={false}
            tone={headerTone}
            count={unprocessedCount > 0 ? unprocessedCount : undefined}
            keepMounted
            onExpandedChange={onExpandedChange}
        >
            <div className="grid gap-4">
                {loadError ? (
                    <Informer tone="alert" variant="bordered" size="s" title="Ошибка загрузки" description={loadError} />
                ) : null}

                {isLoading ? (
                    <Informer tone="system" variant="bordered" size="s" title="Загрузка данных регистрации события…" />
                ) : null}

                <MachineDataPanel
                    rows={machineDataPanel.rows}
                    updatedAt={machineDataPanel.updatedAt}
                    tone={machineDataPanel.tone}
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
