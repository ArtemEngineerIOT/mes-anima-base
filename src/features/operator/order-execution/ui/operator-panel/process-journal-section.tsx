import { useMemo } from "react";

import { useEventRegistrationContext } from "../../model/event-registration/event-registration-context";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionSimpleTable } from "../simple-table";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

const colHeaderClass = "text-[11px] uppercase tracking-wide text-foreground";

export function OrderExecutionProcessJournalSection() {
    const { journal } = useEventRegistrationContext();

    const rows = useMemo(
        () =>
            journal.map((entry) => ({
                code: entry.subCode ? `${entry.eventCodeLabel} (${entry.subCode})` : entry.eventCodeLabel,
                start: entry.startSummary,
                end: entry.endSummary,
                meterage: entry.meterageSummary,
                registeredAt: entry.registeredAt,
            })),
        [journal],
    );

    return (
        <OrderExecutionCollapsibleSection title="Журнал процесса" defaultOpen={false}>
            <div className="grid gap-3">
                <OrderExecutionSimpleTable
                    columns={[
                        { key: "code", label: "Код события", headerClassName: colHeaderClass },
                        { key: "start", label: "Начало", headerClassName: colHeaderClass },
                        { key: "end", label: "Конец", headerClassName: colHeaderClass },
                        { key: "meterage", label: "Метраж", headerClassName: colHeaderClass },
                        { key: "registeredAt", label: "Зарегистрировано", headerClassName: colHeaderClass },
                    ]}
                    rows={rows}
                    emptyText="События ещё не зарегистрированы"
                />

                {journal[0] ? (
                    <div>
                        <div className={cnSectionBlockTitle("mb-2")}>Детали последней записи</div>
                        <dl className="grid gap-1 rounded-sm border border-border bg-muted/20 p-3">
                            {Object.entries(journal[0].details).map(([key, value]) => (
                                <div key={key} className="grid gap-0.5 sm:grid-cols-[140px_1fr]">
                                    <dt className="text-[12px] text-muted-foreground">{key}</dt>
                                    <dd className="text-[12px] text-foreground">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                ) : null}
            </div>
        </OrderExecutionCollapsibleSection>
    );
}
