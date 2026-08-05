import { useEffect, useRef, useState } from "react";

import type { ReleaseProductionEventsSummarySnapshot } from "../../model/release/production-events-summary/types";
import { useProductionEventsSummary } from "../../model/release/production-events-summary/use-production-events-summary";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionRelease } from "../order-execution-release";

const PRODUCTION_EVENTS_SILENT_RELOAD_DEBOUNCE_MS = 300;

type OrderExecutionReleaseSectionProps = {
    workAreaId?: string;
    initialReleaseSummary?: ReleaseProductionEventsSummarySnapshot | null;
    eventsSummaryEnabled: boolean;
    /** После успешного registerRelease — silent-reload мониторинга / прогресса */
    onReleaseRegistered?: () => void;
};

export function OrderExecutionReleaseSection({
    workAreaId,
    initialReleaseSummary = null,
    eventsSummaryEnabled,
    onReleaseRegistered,
}: OrderExecutionReleaseSectionProps) {
    const [expanded, setExpanded] = useState(false);
    const productionEventsSilentReloadRef = useRef<(() => void) | null>(null);
    const silentReloadDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (silentReloadDebounceTimerRef.current !== null) {
                clearTimeout(silentReloadDebounceTimerRef.current);
            }
        };
    }, []);

    const { snapshot, unprocessedCount } = useProductionEventsSummary({
        workAreaId,
        initialSnapshot: initialReleaseSummary,
        enabled: eventsSummaryEnabled,
        onSummaryChanged: () => {
            if (silentReloadDebounceTimerRef.current !== null) {
                clearTimeout(silentReloadDebounceTimerRef.current);
            }

            silentReloadDebounceTimerRef.current = setTimeout(() => {
                productionEventsSilentReloadRef.current?.();
            }, PRODUCTION_EVENTS_SILENT_RELOAD_DEBOUNCE_MS);
        },
    });

    const headerTone = unprocessedCount > 0 ? "warning" : "success";

    return (
        <OrderExecutionCollapsibleSection
            title="Выпуск"
            defaultOpen={false}
            tone={headerTone}
            count={unprocessedCount > 0 ? unprocessedCount : undefined}
            keepMounted
            onExpandedChange={setExpanded}
        >
            <OrderExecutionRelease
                workAreaId={workAreaId}
                enabled={expanded}
                eventsSummary={snapshot}
                onReleaseRegistered={onReleaseRegistered}
                productionEventsSilentReloadRef={productionEventsSilentReloadRef}
            />
        </OrderExecutionCollapsibleSection>
    );
}
