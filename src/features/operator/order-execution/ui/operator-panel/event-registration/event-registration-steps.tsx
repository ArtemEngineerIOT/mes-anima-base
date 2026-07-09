import type { ReactNode } from "react";

import { Button } from "@/shared/ui/kit/button";
import { Icon } from "@/shared/ui/kit/icon";
import { Informer } from "@/shared/ui/kit/informer";
import { Label } from "@/shared/ui/kit/label";
import { MultiSelectCombobox } from "@/shared/ui/kit/multi-select-combobox";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import { cn } from "@/shared/lib/css";

import type { useEventRegistration } from "../../../model/event-registration/use-event-registration";
import {
    areStep2MeterFieldsRequired,
    areStep2TimeFieldsRequired,
    formatEventCodeOptionLabel,
    formatSetupRunLabels,
    getMeterFieldError,
    sanitizeMeterInput,
} from "../../../model/event-registration/field-rules";
import {
    buildLineNumberOptions,
    formatSelectedLinesSummary,
    toggleSelectedLine,
} from "../../../model/event-registration/line-number-options";

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
    disabled,
}: {
    registration: Registration;
    onNext: () => void;
    disabled?: boolean;
}) {
    const { snapshot, draft, selectedCode, onEventCodeChange, onRemoveScrapChange, patchDraft, canProceedStep1 } =
        registration;
    const showSetupRuns = Boolean(selectedCode?.requiresSetupRuns && snapshot.setupRunTags.length > 0);

    return (
        <div className="grid gap-4">
            <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid min-w-0 gap-2">
                        <FieldLabel htmlFor="event-code" required>
                            Код события
                        </FieldLabel>
                        <select
                            id="event-code"
                            value={draft.eventCode ?? ""}
                            disabled={disabled}
                            onChange={(e) => onEventCodeChange(Number(e.target.value))}
                            className={selectClass}
                        >
                            <option value="" disabled>
                                Укажите код события
                            </option>
                            {snapshot.eventCodes.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {formatEventCodeOptionLabel(c.code, c.label)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {showSetupRuns ? (
                        <div className={cn("min-w-0", disabled && "pointer-events-none opacity-50")}>
                            <MultiSelectCombobox
                                fieldLabel="Заезды на настройку"
                                options={snapshot.setupRunTags.map((tag) => ({
                                    value: tag.tag,
                                    label: tag.label,
                                }))}
                                selected={draft.setupRuns}
                                onToggle={(tag) => {
                                    const next = draft.setupRuns.includes(tag)
                                        ? draft.setupRuns.filter((item) => item !== tag)
                                        : [...draft.setupRuns, tag];
                                    patchDraft({ setupRuns: next });
                                }}
                                onClear={() => patchDraft({ setupRuns: [] })}
                                clearAriaLabel="Снять выбор заездов на настройку"
                                placeholder="Не выбрано"
                            />
                        </div>
                    ) : null}
                </div>

                <label
                    htmlFor="remove-scrap-immediately"
                    className="flex items-center gap-2 text-[12px] text-foreground"
                >
                    <input
                        id="remove-scrap-immediately"
                        type="checkbox"
                        checked={draft.removeScrapImmediately === true}
                        disabled={disabled}
                        onChange={(e) => onRemoveScrapChange(e.target.checked)}
                        className="size-4 rounded border-input"
                    />
                    Удалять брак сразу?
                </label>
            </div>

            <div className="flex justify-end">
                <NextButton disabled={disabled || !canProceedStep1} onClick={onNext} />
            </div>
        </div>
    );
}

export function EventRegistrationStep2({
    registration,
    onBack,
    onNext,
    disabled,
}: {
    registration: Registration;
    onBack: () => void;
    onNext: () => void;
    disabled?: boolean;
}) {
    const {
        snapshot,
        draft,
        scrapMode,
        patchDraft,
        onWholeStageChange,
        canProceedStep2,
    } = registration;
    const immediate = scrapMode === "immediate";
    const lineOptions = buildLineNumberOptions(snapshot);
    const fieldsDisabled = Boolean(disabled);
    const meterFieldsDisabled = fieldsDisabled || (immediate && draft.wholeStage);
    const timeFieldsDisabled = meterFieldsDisabled;
    const metersRequired = scrapMode ? areStep2MeterFieldsRequired(draft, scrapMode) : false;
    const timesRequired = scrapMode ? areStep2TimeFieldsRequired(draft, scrapMode) : false;

    if (draft.removeScrapImmediately == null) {
        return null;
    }

    return (
        <div className="grid gap-4">
            {immediate ? (
                <>
                    <EventRegistrationRollField
                        snapshot={snapshot}
                        value={draft.roll}
                        disabled={fieldsDisabled}
                        onChange={(roll) => patchDraft({ roll })}
                    />

                    <label className="flex items-center gap-2 text-[12px] text-foreground">
                        <input
                            type="checkbox"
                            checked={draft.wholeStage}
                            disabled={fieldsDisabled}
                            onChange={(e) => onWholeStageChange(e.target.checked)}
                            className="size-4 rounded border-input"
                        />
                        Весь этап
                    </label>

                    <EventRegistrationMeterRow
                        draft={draft}
                        disabled={meterFieldsDisabled}
                        required={metersRequired}
                        onPatch={patchDraft}
                    />

                    <EventRegistrationTimeRow
                        draft={draft}
                        disabled={timeFieldsDisabled}
                        required={timesRequired}
                        onPatch={patchDraft}
                    />
                </>
            ) : (
                <>
                    <div className="grid gap-3 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                            <EventRegistrationRollField
                                snapshot={snapshot}
                                value={draft.roll}
                                disabled={fieldsDisabled}
                                onChange={(roll) => patchDraft({ roll })}
                            />
                        </div>

                        <div className="grid min-w-0 gap-2">
                            <FieldLabel htmlFor="side" required>
                                Сторона
                            </FieldLabel>
                            <select
                                id="side"
                                value={draft.side}
                                disabled={fieldsDisabled}
                                onChange={(e) => patchDraft({ side: e.target.value as "" | "PM" | "Passer" })}
                                className={selectClass}
                            >
                                <option value="">Не выбрано</option>
                                {snapshot.sideOptions.map((side) => (
                                    <option key={side} value={side}>
                                        {side}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={cn("min-w-0", fieldsDisabled && "pointer-events-none opacity-50")}>
                            <MultiSelectCombobox
                                fieldLabel="Ряд *"
                                options={lineOptions}
                                selected={draft.selectedLines}
                                onToggle={(lineNumber) => {
                                    patchDraft({
                                        selectedLines: toggleSelectedLine(draft.selectedLines, lineNumber),
                                    });
                                }}
                                onClear={() => patchDraft({ selectedLines: [] })}
                                clearAriaLabel="Снять выбор рядов"
                                placeholder="Не выбрано"
                            />
                        </div>
                    </div>

                    <EventRegistrationMeterRow
                        draft={draft}
                        disabled={fieldsDisabled}
                        required={metersRequired}
                        onPatch={patchDraft}
                    />

                    <EventRegistrationTimeRow
                        draft={draft}
                        disabled={fieldsDisabled}
                        required={timesRequired}
                        onPatch={patchDraft}
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <FieldLabel htmlFor="start-card" required>
                                Карточка 1
                            </FieldLabel>
                            <select
                                id="start-card"
                                value={draft.startCard}
                                disabled={fieldsDisabled}
                                onChange={(e) => patchDraft({ startCard: e.target.value })}
                                className={selectClass}
                            >
                                <option value="">Не выбрано</option>
                                {snapshot.cardColorOptions.map((card) => (
                                    <option key={card} value={card}>
                                        {card}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel htmlFor="end-card" required>
                                Карточка 2
                            </FieldLabel>
                            <select
                                id="end-card"
                                value={draft.endCard}
                                disabled={fieldsDisabled}
                                onChange={(e) => patchDraft({ endCard: e.target.value })}
                                className={selectClass}
                            >
                                <option value="">Не выбрано</option>
                                {snapshot.cardColorOptions.map((card) => (
                                    <option key={card} value={card}>
                                        {card}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </>
            )}

            <EventRegistrationCommentField
                draft={draft}
                disabled={fieldsDisabled}
                onChange={(comment) => patchDraft({ comment })}
            />

            <div className="flex justify-between gap-2">
                <Button type="button" variant="outline" disabled={disabled} onClick={onBack}>
                    Назад
                </Button>
                <NextButton disabled={disabled || !canProceedStep2} onClick={onNext} />
            </div>
        </div>
    );
}

function EventRegistrationRollField({
    snapshot,
    value,
    disabled,
    onChange,
}: {
    snapshot: Registration["snapshot"];
    value: string;
    disabled?: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <div className="grid gap-2">
            <FieldLabel htmlFor="roll" required>
                Рулон
            </FieldLabel>
            <select
                id="roll"
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className={selectClass}
            >
                {snapshot.rollOptions.map((roll) => (
                    <option key={roll} value={roll}>
                        {roll}
                    </option>
                ))}
            </select>
        </div>
    );
}

function EventRegistrationMeterRow({
    draft,
    disabled,
    required,
    onPatch,
}: {
    draft: Registration["draft"];
    disabled?: boolean;
    required: boolean;
    onPatch: Registration["patchDraft"];
}) {
    const meterFromError = getMeterFieldError(draft.meterFrom, required);
    const meterToError = getMeterFieldError(draft.meterTo, required);

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
                <FieldLabel htmlFor="meter-from" required={required}>
                    Начало, м
                </FieldLabel>
                <input
                    id="meter-from"
                    inputMode="decimal"
                    value={draft.meterFrom}
                    disabled={disabled}
                    aria-invalid={Boolean(meterFromError)}
                    onChange={(e) => onPatch({ meterFrom: sanitizeMeterInput(e.target.value) })}
                    className={cn(inputClass, meterFromError && "border-destructive")}
                />
                {meterFromError ? (
                    <span className="text-[11px] text-destructive">{meterFromError}</span>
                ) : null}
            </div>
            <div className="grid gap-2">
                <FieldLabel htmlFor="meter-to" required={required}>
                    Конец, м
                </FieldLabel>
                <input
                    id="meter-to"
                    inputMode="decimal"
                    value={draft.meterTo}
                    disabled={disabled}
                    aria-invalid={Boolean(meterToError)}
                    onChange={(e) => onPatch({ meterTo: sanitizeMeterInput(e.target.value) })}
                    className={cn(inputClass, meterToError && "border-destructive")}
                />
                {meterToError ? <span className="text-[11px] text-destructive">{meterToError}</span> : null}
            </div>
        </div>
    );
}

function EventRegistrationTimeRow({
    draft,
    disabled,
    required,
    onPatch,
}: {
    draft: Registration["draft"];
    disabled?: boolean;
    required: boolean;
    onPatch: Registration["patchDraft"];
}) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
                <FieldLabel htmlFor="time-from" required={required}>
                    Начало, мин
                </FieldLabel>
                <input
                    id="time-from"
                    type="time"
                    step={1}
                    value={draft.timeFrom}
                    disabled={disabled}
                    onChange={(e) => onPatch({ timeFrom: e.target.value })}
                    className={inputClass}
                />
            </div>
            <div className="grid gap-2">
                <FieldLabel htmlFor="time-to" required={required}>
                    Конец, мин
                </FieldLabel>
                <input
                    id="time-to"
                    type="time"
                    step={1}
                    value={draft.timeTo}
                    disabled={disabled}
                    onChange={(e) => onPatch({ timeTo: e.target.value })}
                    className={inputClass}
                />
            </div>
        </div>
    );
}

function EventRegistrationCommentField({
    draft,
    disabled,
    onChange,
}: {
    draft: Registration["draft"];
    disabled?: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <div className="grid gap-2">
            <FieldLabel htmlFor="comment" required>
                Комментарий
            </FieldLabel>
            <textarea
                id="comment"
                value={draft.comment}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                className={textareaClass}
            />
        </div>
    );
}

export function EventRegistrationStep3({
    registration,
    onBack,
    onRegister,
    disabled,
}: {
    registration: Registration;
    onBack: () => void;
    onRegister: () => void;
    disabled?: boolean;
}) {
    const { draft, selectedCode, scrapMode, snapshot, registerError, isRegisterEventPending } = registration;

    if (!selectedCode || scrapMode == null) return null;

    const setupRunsSummary =
        draft.setupRuns.length > 0
            ? formatSetupRunLabels(snapshot.setupRunTags, draft.setupRuns)
            : "";

    const summary = [
        { label: "Код события", value: `${selectedCode.code} — ${selectedCode.label}` },
        ...(setupRunsSummary ? [{ label: "Заезды на настройку", value: setupRunsSummary }] : []),
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
        ...(draft.selectedLines.length > 0
            ? [{ label: "Ряд", value: formatSelectedLinesSummary(draft.selectedLines) }]
            : []),
        ...(draft.startCard ? [{ label: "Карточка 1", value: draft.startCard }] : []),
        ...(draft.endCard ? [{ label: "Карточка 2", value: draft.endCard }] : []),
        ...(draft.comment ? [{ label: "Комментарий", value: draft.comment }] : []),
    ];

    return (
        <div className="grid gap-4">
            <dl className="grid gap-2 rounded-sm border border-border bg-muted/20 p-3">
                {summary.map((row) => (
                    <div key={row.label} className="grid gap-0.5 sm:grid-cols-[160px_1fr]">
                        <dt className="text-[12px] text-muted-foreground">{row.label}</dt>
                        <dd className="text-[12px] text-foreground">{row.value}</dd>
                    </div>
                ))}
            </dl>

            <Informer
                tone="warning"
                variant="bordered"
                size="s"
                title="Внимание"
                description="Записи о событии будут добавлены в систему. Убедитесь, что введённые данные верны."
            />

            {registerError ? (
                <Informer tone="alert" variant="bordered" size="s" title="Ошибка регистрации" description={registerError} />
            ) : null}

            <div className="flex justify-between gap-2">
                <Button type="button" variant="outline" disabled={disabled} onClick={onBack}>
                    Назад
                </Button>
                <Button type="button" disabled={disabled} onClick={() => void onRegister()}>
                    {isRegisterEventPending ? "Регистрация…" : "Зарегистрировать"}
                </Button>
            </div>
        </div>
    );
}
