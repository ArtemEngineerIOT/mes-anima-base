import type { ReactNode } from "react";

import { Button } from "@/shared/ui/kit/button";
import { Icon } from "@/shared/ui/kit/icon";
import { Label } from "@/shared/ui/kit/label";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";

import type { useEventRegistration } from "../../../model/event-registration/use-event-registration";
import { isFieldRequired } from "../../../model/event-registration/field-rules";

const selectClass =
    "h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";
const inputClass =
    "h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";
const textareaClass =
    "placeholder:text-muted-foreground min-h-[72px] w-full resize-y rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

type Registration = ReturnType<typeof useEventRegistration>;

function RequiredMark({ show }: { show: boolean }) {
    if (!show) return null;
    return <span className="text-destructive"> *</span>;
}

function FieldLabel({ htmlFor, children, required }: { htmlFor?: string; children: ReactNode; required?: boolean }) {
    return (
        <Label htmlFor={htmlFor} className={comboboxFieldLabelClassName}>
            {children}
            <RequiredMark show={Boolean(required)} />
        </Label>
    );
}

function NextButton({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
    return (
        <Button type="button" disabled={disabled} onClick={onClick}>
            Далее
            <Icon name="arrow_forward" size="sm" className="ml-1" />
        </Button>
    );
}

export function EventRegistrationStep1({
    registration,
    onNext,
}: {
    registration: Registration;
    onNext: () => void;
}) {
    const { snapshot, draft, onEventCodeChange, onRemoveScrapChange, canProceedStep1 } = registration;

    return (
        <div className="grid gap-4">
            <div className="grid gap-3 sm:max-w-md">
                <div className="grid gap-2">
                    <FieldLabel htmlFor="event-code" required>
                        Код события
                    </FieldLabel>
                    <select
                        id="event-code"
                        value={draft.eventCode ?? ""}
                        onChange={(e) => onEventCodeChange(Number(e.target.value))}
                        className={selectClass}
                    >
                        <option value="" disabled>
                            Укажите код события
                        </option>
                        {snapshot.eventCodes.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.code} — {c.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid gap-2">
                    <FieldLabel required>Удалять брак сразу?</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant={draft.removeScrapImmediately === true ? "default" : "outline"}
                            onClick={() => onRemoveScrapChange(true)}
                        >
                            Да
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={draft.removeScrapImmediately === false ? "default" : "outline"}
                            onClick={() => onRemoveScrapChange(false)}
                        >
                            Нет
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <NextButton disabled={!canProceedStep1} onClick={onNext} />
            </div>
        </div>
    );
}

export function EventRegistrationStep2({
    registration,
    onBack,
    onNext,
}: {
    registration: Registration;
    onBack: () => void;
    onNext: () => void;
}) {
    const {
        snapshot,
        draft,
        selectedCode,
        scrapMode,
        patchDraft,
        onWholeStageChange,
        canProceedStep2,
    } = registration;
    const immediate = scrapMode === "immediate";

    return (
        <div className="grid gap-4">
            {selectedCode?.subCodes ? (
                <div className="grid gap-2 sm:max-w-md">
                    <FieldLabel htmlFor="event-subcode">Подкод (зеропулы)</FieldLabel>
                    <select
                        id="event-subcode"
                        value={draft.subCode}
                        onChange={(e) => patchDraft({ subCode: e.target.value })}
                        className={selectClass}
                    >
                        {selectedCode.subCodes.map((sc) => (
                            <option key={sc} value={sc}>
                                {sc}
                            </option>
                        ))}
                    </select>
                </div>
            ) : null}

            {draft.removeScrapImmediately != null ? (
                immediate ? (
                    <>
                        <label className="flex items-center gap-2 text-[12px] text-foreground">
                            <input
                                type="checkbox"
                                checked={draft.wholeStage}
                                onChange={(e) => onWholeStageChange(e.target.checked)}
                                className="size-4 rounded border-input"
                            />
                            Весь этап
                        </label>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <FieldLabel
                                    htmlFor="meter-from"
                                    required={isFieldRequired(selectedCode, "meterage", draft) && !draft.wholeStage}
                                >
                                    Начало (м)
                                </FieldLabel>
                                <input
                                    id="meter-from"
                                    value={draft.meterFrom}
                                    disabled={draft.wholeStage}
                                    onChange={(e) => patchDraft({ meterFrom: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div className="grid gap-2">
                                <FieldLabel
                                    htmlFor="meter-to"
                                    required={isFieldRequired(selectedCode, "meterage", draft) && !draft.wholeStage}
                                >
                                    Конец (м)
                                </FieldLabel>
                                <input
                                    id="meter-to"
                                    value={draft.meterTo}
                                    disabled={draft.wholeStage}
                                    onChange={(e) => patchDraft({ meterTo: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div className="grid gap-2">
                                <FieldLabel
                                    htmlFor="time-from"
                                    required={isFieldRequired(selectedCode, "time", draft) && !draft.wholeStage}
                                >
                                    Начало (время)
                                </FieldLabel>
                                <input
                                    id="time-from"
                                    type="datetime-local"
                                    value={draft.timeFrom}
                                    disabled={draft.wholeStage}
                                    onChange={(e) => patchDraft({ timeFrom: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div className="grid gap-2">
                                <FieldLabel
                                    htmlFor="time-to"
                                    required={isFieldRequired(selectedCode, "time", draft) && !draft.wholeStage}
                                >
                                    Конец (время)
                                </FieldLabel>
                                <input
                                    id="time-to"
                                    type="datetime-local"
                                    value={draft.timeTo}
                                    disabled={draft.wholeStage}
                                    onChange={(e) => patchDraft({ timeTo: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <FieldLabel htmlFor="side">Сторона</FieldLabel>
                            <select
                                id="side"
                                value={draft.side}
                                onChange={(e) => patchDraft({ side: e.target.value as "" | "PM" | "Passer" })}
                                className={selectClass}
                            >
                                <option value="">Выберите сторону</option>
                                {snapshot.sideOptions.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel htmlFor="lines">Ряд (линии)</FieldLabel>
                            <input
                                id="lines"
                                value={draft.lineNumbers}
                                placeholder={`1, 3, 5-7 или все (${snapshot.lineCount})`}
                                onChange={(e) => patchDraft({ lineNumbers: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel htmlFor="meter-from-def" required={isFieldRequired(selectedCode, "meterage", draft)}>
                                Начало (м)
                            </FieldLabel>
                            <input
                                id="meter-from-def"
                                value={draft.meterFrom}
                                onChange={(e) => patchDraft({ meterFrom: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel htmlFor="meter-to-def" required={isFieldRequired(selectedCode, "meterage", draft)}>
                                Конец (м)
                            </FieldLabel>
                            <input
                                id="meter-to-def"
                                value={draft.meterTo}
                                onChange={(e) => patchDraft({ meterTo: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel htmlFor="start-card">Карточка начала</FieldLabel>
                            <select
                                id="start-card"
                                value={draft.startCard}
                                onChange={(e) => patchDraft({ startCard: e.target.value })}
                                className={selectClass}
                            >
                                <option value="">—</option>
                                {snapshot.cardColorOptions.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel htmlFor="end-card">Карточка конца</FieldLabel>
                            <select
                                id="end-card"
                                value={draft.endCard}
                                onChange={(e) => patchDraft({ endCard: e.target.value })}
                                className={selectClass}
                            >
                                <option value="">—</option>
                                {snapshot.cardColorOptions.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel htmlFor="time-from-def" required={isFieldRequired(selectedCode, "time", draft)}>
                                Начало (время)
                            </FieldLabel>
                            <input
                                id="time-from-def"
                                type="datetime-local"
                                value={draft.timeFrom}
                                onChange={(e) => patchDraft({ timeFrom: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel htmlFor="time-to-def" required={isFieldRequired(selectedCode, "time", draft)}>
                                Конец (время)
                            </FieldLabel>
                            <input
                                id="time-to-def"
                                type="datetime-local"
                                value={draft.timeTo}
                                onChange={(e) => patchDraft({ timeTo: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                    </div>
                )
            ) : null}

            {draft.removeScrapImmediately != null ? (
                <>
                    <div className="grid gap-2">
                        <FieldLabel htmlFor="roll" required>
                            Рулон
                        </FieldLabel>
                        <select
                            id="roll"
                            value={draft.roll}
                            onChange={(e) => patchDraft({ roll: e.target.value })}
                            className={selectClass}
                        >
                            {snapshot.rollOptions.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel htmlFor="comment" required={isFieldRequired(selectedCode, "comment", draft)}>
                            Комментарий
                        </FieldLabel>
                        <textarea
                            id="comment"
                            value={draft.comment}
                            onChange={(e) => patchDraft({ comment: e.target.value })}
                            rows={3}
                            className={textareaClass}
                        />
                    </div>
                </>
            ) : null}

            <div className="flex justify-between gap-2">
                <Button type="button" variant="outline" onClick={onBack}>
                    Назад
                </Button>
                <NextButton disabled={!canProceedStep2} onClick={onNext} />
            </div>
        </div>
    );
}

export function EventRegistrationStep3({
    registration,
    onBack,
    onRegister,
}: {
    registration: Registration;
    onBack: () => void;
    onRegister: () => void;
}) {
    const { draft, selectedCode, scrapMode } = registration;

    if (!selectedCode || scrapMode == null) return null;

    const summary = [
        { label: "Код события", value: `${selectedCode.code} — ${selectedCode.label}` },
        ...(draft.subCode ? [{ label: "Подкод", value: draft.subCode }] : []),
        { label: "Удалять брак сразу", value: scrapMode === "immediate" ? "Да" : "Нет" },
        ...(draft.wholeStage ? [{ label: "Весь этап", value: "Да" }] : []),
        ...(!draft.wholeStage && (draft.meterFrom || draft.meterTo)
            ? [{ label: "Метраж", value: `${draft.meterFrom || "—"} — ${draft.meterTo || "—"}` }]
            : []),
        ...(!draft.wholeStage && (draft.timeFrom || draft.timeTo)
            ? [{ label: "Время", value: `${draft.timeFrom || "—"} — ${draft.timeTo || "—"}` }]
            : []),
        { label: "Рулон", value: draft.roll || "—" },
        ...(draft.side ? [{ label: "Сторона", value: draft.side }] : []),
        ...(draft.lineNumbers ? [{ label: "Ряд", value: draft.lineNumbers }] : []),
        ...(draft.startCard ? [{ label: "Карточка начала", value: draft.startCard }] : []),
        ...(draft.endCard ? [{ label: "Карточка конца", value: draft.endCard }] : []),
        ...(draft.comment ? [{ label: "Комментарий", value: draft.comment }] : []),
    ];

    return (
        <div className="grid gap-4">
            <InformerWarning />

            <dl className="grid gap-2 rounded-sm border border-border bg-muted/20 p-3">
                {summary.map((row) => (
                    <div key={row.label} className="grid gap-0.5 sm:grid-cols-[160px_1fr]">
                        <dt className="text-[12px] text-muted-foreground">{row.label}</dt>
                        <dd className="text-[12px] text-foreground">{row.value}</dd>
                    </div>
                ))}
            </dl>

            <div className="flex justify-between gap-2">
                <Button type="button" variant="outline" onClick={onBack}>
                    Назад
                </Button>
                <Button type="button" onClick={onRegister}>
                    Зарегистрировать
                </Button>
            </div>
        </div>
    );
}

function InformerWarning() {
    return (
        <div className="rounded-sm border border-border bg-card px-3 py-2 text-[12px] text-muted-foreground">
            <span className="font-medium text-foreground">Внимание.</span> Записи о событии будут добавлены в систему.
            Убедитесь, что введённые данные верны.
        </div>
    );
}
