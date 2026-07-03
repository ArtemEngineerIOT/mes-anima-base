import { useEventRegistrationContext } from "../../model/event-registration/event-registration-context";
import { useOrderExecutionMachineStompSnapshot } from "../../model/machine-stomp/order-execution-machine-stomp-context";
import { hasOrderExecutionMachineStompData } from "../../model/machine-stomp/order-execution-machine-data";
import { mapEventRegistrationMachineDataRows } from "../../model/event-registration/map-event-registration-machine-data-rows";
import { MachineDataPanel } from "@/shared/ui/kit/machine-data-panel";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { EventRegistrationStepper } from "./event-registration/event-registration-stepper";
import {
    EventRegistrationStep1,
    EventRegistrationStep2,
    EventRegistrationStep3,
} from "./event-registration/event-registration-steps";

export function OrderExecutionEventRegistrationSection() {
    const registration = useEventRegistrationContext();
    const machineData = useOrderExecutionMachineStompSnapshot();
    const { step, unprocessedCount, goToStep, goNext, goBack, registerEvent, snapshot } = registration;

    const headerTone = unprocessedCount > 0 ? "warning" : undefined;
    const machineDataRows = hasOrderExecutionMachineStompData(machineData)
        ? machineData.rows
        : mapEventRegistrationMachineDataRows(snapshot.telemetry);

    return (
        <OrderExecutionCollapsibleSection
            title="Регистрация событий"
            defaultOpen={false}
            tone={headerTone}
            count={unprocessedCount > 0 ? unprocessedCount : undefined}
        >
            <div className="grid gap-4">
                <MachineDataPanel
                    rows={machineDataRows}
                    updatedAt={hasOrderExecutionMachineStompData(machineData) ? machineData.updatedAt : null}
                />

                <EventRegistrationStepper currentStep={step} onStepClick={goToStep} />

                {step === 1 ? <EventRegistrationStep1 registration={registration} onNext={goNext} /> : null}
                {step === 2 ? (
                    <EventRegistrationStep2 registration={registration} onBack={goBack} onNext={goNext} />
                ) : null}
                {step === 3 ? (
                    <EventRegistrationStep3 registration={registration} onBack={goBack} onRegister={registerEvent} />
                ) : null}
            </div>
        </OrderExecutionCollapsibleSection>
    );
}
