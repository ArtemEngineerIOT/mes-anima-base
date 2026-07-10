import { Button } from "@/shared/ui/kit/button";
import { Informer } from "@/shared/ui/kit/informer";
import { Input } from "@/shared/ui/kit/input";
import { cn } from "@/shared/lib/css";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";

import { formatDefectEventOptionLabel } from "../model/constants";
import type { DefectWeighingModel } from "../model/use-defect-weighing";

const selectClass =
    "mt-1 h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

type DefectWeighingFormPanelProps = {
    model: DefectWeighingModel;
};

export function DefectWeighingFormPanel({ model }: DefectWeighingFormPanelProps) {
    const {
        scaleOptions,
        form,
        patchForm,
        selectPopularDefect,
        popularEventCodes,
        allEventCodes,
        registerDefect,
        registerError,
        canRegister,
        isRegistering,
        selectedStage,
    } = model;

    return (
        <div className="flex flex-col gap-4">
            {registerError ? (
                <Informer tone="alert" variant="bordered" size="s" title="Ошибка" description={registerError} />
            ) : null}

            {!selectedStage ? (
                <Informer
                    tone="warning"
                    variant="bordered"
                    size="s"
                    title="Этап не выбран"
                    description="Выберите этап в таблице слева для регистрации брака"
                />
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <div className={comboboxFieldLabelClassName}>Весы</div>
                    <select
                        className={selectClass}
                        value={form.scaleId}
                        disabled={scaleOptions.length === 0}
                        onChange={(event) => patchForm({ scaleId: event.target.value })}
                    >
                        {scaleOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <div className={comboboxFieldLabelClassName}>Вес</div>
                    <Input
                        className="mt-1"
                        value={form.weightKg}
                        onChange={(event) => patchForm({ weightKg: event.target.value })}
                        inputMode="decimal"
                        aria-label="Вес брака, кг"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {popularEventCodes.map((event) => {
                    const isActive = form.eventCode === event.code;
                    return (
                        <Button
                            key={event.code}
                            type="button"
                            size="sm"
                            variant={isActive ? "default" : "outline"}
                            className={cn("h-auto min-h-9 whitespace-normal px-2 py-1.5 text-left text-[11px] leading-tight")}
                            onClick={() => selectPopularDefect(event.code)}
                        >
                            {event.label}
                        </Button>
                    );
                })}
            </div>

            <div>
                <div className={comboboxFieldLabelClassName}>Тип брака</div>
                <select
                    className={selectClass}
                    value={form.eventCode}
                    onChange={(event) => patchForm({ eventCode: event.target.value })}
                >
                    {allEventCodes.map((event) => (
                        <option key={event.code} value={event.code}>
                            {formatDefectEventOptionLabel(event)}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <div className={comboboxFieldLabelClassName}>Примечание</div>
                <textarea
                    className="mt-1 min-h-20 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    placeholder="Заполните при необходимости"
                    value={form.note}
                    onChange={(event) => patchForm({ note: event.target.value })}
                />
            </div>

            <div className="flex justify-end">
                <Button
                    type="button"
                    size="sm"
                    pending={isRegistering}
                    pendingLabel="Регистрация…"
                    disabled={!canRegister}
                    onClick={() => void registerDefect()}
                >
                    Зарегистрировать брак
                </Button>
            </div>
        </div>
    );
}
