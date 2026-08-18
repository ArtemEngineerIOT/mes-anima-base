import { useCallback, useEffect, useRef } from "react";

import type { UnprocessedSignalsSummarySnapshot } from "../../model/event-registration/unprocessed-signals-summary/types";
import { useEventRegistrationContext } from "../../model/event-registration/event-registration-context";
import { useUnprocessedSignalsSummary } from "../../model/event-registration/unprocessed-signals-summary/use-unprocessed-signals-summary";
import { FloatingAutoDismissInformer } from "@/shared/ui/kit/floating-auto-dismiss-informer";
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

const UNPROCESSED_SIGNALS_SILENT_RELOAD_DEBOUNCE_MS = 300;

type OrderExecutionEventRegistrationSectionProps = {
    workAreaId?: string;
    initialMachineSignalsSummary?: UnprocessedSignalsSummarySnapshot | null;
    signalsSummaryEnabled: boolean;
    onExpandedChange?: (expanded: boolean) => void;
};

export function OrderExecutionEventRegistrationSection({
    workAreaId,
    initialMachineSignalsSummary = null,
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
        isLoading,
        isWizardDisabled,
        reloadUnprocessedSilent,
        registerError,
        dismissRegisterError,
        registerSuccessMessage,
        dismissRegisterSuccess,
        discardError,
        dismissDiscardError,
    } = registration;

    const silentReloadDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reloadUnprocessedSilentRef = useRef(reloadUnprocessedSilent);
    reloadUnprocessedSilentRef.current = reloadUnprocessedSilent;

    useEffect(() => {
        return () => {
            if (silentReloadDebounceTimerRef.current !== null) {
                clearTimeout(silentReloadDebounceTimerRef.current);
            }
        };
    }, []);

    const {
        snapshot: signalsSummary,
        isLoading: isSignalsSummaryLoading,
        error: signalsSummaryError,
    } = useUnprocessedSignalsSummary({
        workAreaId,
        initialSnapshot: initialMachineSignalsSummary,
        enabled: signalsSummaryEnabled,
        onSummaryChanged: () => {
            if (silentReloadDebounceTimerRef.current !== null) {
                clearTimeout(silentReloadDebounceTimerRef.current);
            }

            silentReloadDebounceTimerRef.current = setTimeout(() => {
                reloadUnprocessedSilentRef.current();
            }, UNPROCESSED_SIGNALS_SILENT_RELOAD_DEBOUNCE_MS);
        },
    });

    const handleExpandedChange = useCallback(
        (expanded: boolean) => {
            onExpandedChange?.(expanded);
        },
        [onExpandedChange],
    );

    const headerCount =
        signalsSummary.unprocessedCount > 0 ? signalsSummary.unprocessedCount : unprocessedCount;
    const headerTone = headerCount > 0 ? "warning" : "success";

    /** Плашка — только если есть необработанные сигналы с машины (как в «Выпуск» / «Материалы») */
    const hasMachineSignals = unprocessedCount > 0 || signalsSummary.unprocessedCount > 0;

    return (
        <>
            <OrderExecutionCollapsibleSection
                title="Регистрация события"
                defaultOpen={false}
                tone={headerTone}
                count={headerCount > 0 ? headerCount : undefined}
                keepMounted
                isContentReady={!isLoading}
                onExpandedChange={handleExpandedChange}
            >
                <div className="grid gap-4">
                    {loadError ? (
                        <Informer
                            tone="alert"
                            variant="bordered"
                            size="s"
                            title="Ошибка загрузки"
                            description={loadError}
                        />
                    ) : null}

                    {hasMachineSignals ? (
                        <EventRegistrationSignalsSummaryPanel
                            snapshot={signalsSummary}
                            isLoading={isSignalsSummaryLoading}
                            error={signalsSummaryError}
                        />
                    ) : null}

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

            {registerSuccessMessage ? (
                <FloatingAutoDismissInformer
                    key={`register-success:${registerSuccessMessage}`}
                    tone="success"
                    variant="bordered"
                    size="s"
                    title={registerSuccessMessage}
                    onDismiss={dismissRegisterSuccess}
                />
            ) : null}

            {registerError ? (
                <FloatingAutoDismissInformer
                    key={`register-error:${registerError}`}
                    tone="alert"
                    variant="bordered"
                    size="s"
                    title="Ошибка"
                    description={registerError}
                    onDismiss={dismissRegisterError}
                />
            ) : null}

            {discardError ? (
                <FloatingAutoDismissInformer
                    key={`discard-error:${discardError}`}
                    tone="alert"
                    variant="bordered"
                    size="s"
                    title="Ошибка"
                    description={discardError}
                    onDismiss={dismissDiscardError}
                />
            ) : null}
        </>
    );
}
