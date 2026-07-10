import type { MaterialsWriteoffFormState } from "@/features/operator/order-execution/model/materials-writeoff/materials-writeoff-form";
import type { MaterialsReturnWarehouseOption } from "@/features/operator/order-execution/model/materials-writeoff/types";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";

type MaterialsWriteoffFormPanelProps = {
    selectedNomenclature?: string | null;
    writeoffForm: MaterialsWriteoffFormState;
    warehouseOptions: MaterialsReturnWarehouseOption[];
    isWarehousesLoading?: boolean;
    warehousesError?: string | null;
    isWriteoffWeightLoading?: boolean;
    writeoffWeightError?: string | null;
    canCalculateWeight?: boolean;
    isWriteoffActionsEnabled?: boolean;
    isReflectReturnEnabled?: boolean;
    isFullWriteoffEnabled?: boolean;
    isReflectingReturn?: boolean;
    isWritingOffFully?: boolean;
    isSubmittingStageLkm?: boolean;
    reflectReturnError?: string | null;
    writeOffFullyError?: string | null;
    submitStageLkmError?: string | null;
    isFormEnabled?: boolean;
    onCalculateWriteoffWeight: () => void;
    onReflectMaterialReturn: () => void;
    onWriteOffMaterialFully: () => void;
    onSubmitStageLkmWriteoff: () => void;
    onWriteoffFormChange: (patch: Partial<MaterialsWriteoffFormState>) => void;
};

export function MaterialsWriteoffFormPanel({
    selectedNomenclature = null,
    writeoffForm,
    warehouseOptions,
    isWarehousesLoading = false,
    warehousesError = null,
    isWriteoffWeightLoading = false,
    writeoffWeightError = null,
    canCalculateWeight = false,
    isWriteoffActionsEnabled = false,
    isReflectReturnEnabled = false,
    isFullWriteoffEnabled = false,
    isReflectingReturn = false,
    isWritingOffFully = false,
    isSubmittingStageLkm = false,
    reflectReturnError = null,
    writeOffFullyError = null,
    submitStageLkmError = null,
    isFormEnabled = false,
    onCalculateWriteoffWeight,
    onReflectMaterialReturn,
    onWriteOffMaterialFully,
    onSubmitStageLkmWriteoff,
    onWriteoffFormChange,
}: MaterialsWriteoffFormPanelProps) {
    const fieldsDisabled = !isFormEnabled;
    const warehouseSelectDisabled = fieldsDisabled || isWarehousesLoading || Boolean(warehousesError);
    const warehousePlaceholder = isWarehousesLoading
        ? "Загрузка…"
        : warehousesError
          ? "Склады недоступны"
          : "Выберите склад";

    return (
        <div className="space-y-3">
            <div>
                <div className={comboboxFieldLabelClassName}>Списываемая номенклатура</div>
                <Input
                    value={selectedNomenclature ?? ""}
                    readOnly
                    disabled
                    placeholder="Выберите рулон кнопкой «Списать»"
                    className="mt-1"
                />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                    <div className={comboboxFieldLabelClassName}>Метраж, м</div>
                    <Input
                        value={writeoffForm.meters}
                        inputMode="decimal"
                        disabled={fieldsDisabled}
                        onChange={(e) => onWriteoffFormChange({ meters: e.target.value })}
                        className="mt-1"
                    />
                    <div className="mt-1 min-h-4" aria-hidden />
                </div>
                <div>
                    <div className={comboboxFieldLabelClassName}>Вес, кг</div>
                    <Input
                        value={isWriteoffWeightLoading ? "…" : writeoffForm.weight}
                        readOnly
                        disabled
                        placeholder="Пересчитайте по метражу"
                        className="mt-1"
                    />
                    <div
                        className="mt-1 min-h-4 text-[10px] leading-4 text-destructive"
                        aria-live="polite"
                    >
                        {writeoffWeightError ?? "\u00a0"}
                    </div>
                </div>
                <div>
                    <div className={comboboxFieldLabelClassName}>Отправить на склад</div>
                    <div className="mt-1 flex items-center gap-2">
                        <select
                            className="h-9 min-w-0 flex-1 rounded-sm border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                            value={writeoffForm.warehouse}
                            disabled={warehouseSelectDisabled || warehouseOptions.length === 0}
                            onChange={(e) => onWriteoffFormChange({ warehouse: e.target.value })}
                        >
                            <option value="">{warehousePlaceholder}</option>
                            {warehouseOptions.map((option) => (
                                <option key={option.warehouseCode} value={option.warehouseCode}>
                                    {option.warehouseLabel}
                                </option>
                            ))}
                        </select>
                        <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                            pending={isWriteoffWeightLoading}
                            pendingLabel="Пересчёт…"
                            disabled={!canCalculateWeight || isWriteoffWeightLoading}
                            onClick={onCalculateWriteoffWeight}
                        >
                            Пересчитать
                        </Button>
                    </div>
                    <div
                        className="mt-1 min-h-4 text-[10px] leading-4 text-destructive"
                        aria-live="polite"
                    >
                        {warehousesError ?? "\u00a0"}
                    </div>
                </div>
            </div>

            <div
                className="min-h-4 text-right text-[12px] leading-4 text-destructive"
                aria-live="polite"
            >
                {submitStageLkmError ?? "\u00a0"}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
                {reflectReturnError ? (
                    <div className="w-full text-right text-[12px] text-destructive">{reflectReturnError}</div>
                ) : null}
                {writeOffFullyError ? (
                    <div className="w-full text-right text-[12px] text-destructive">{writeOffFullyError}</div>
                ) : null}
                <Button
                    size="sm"
                    pending={isReflectingReturn}
                    pendingLabel="Отражение…"
                    disabled={!isReflectReturnEnabled}
                    onClick={onReflectMaterialReturn}
                >
                    Отразить возврат
                </Button>
                <Button
                    size="sm"
                    pending={isWritingOffFully}
                    pendingLabel="Списание…"
                    disabled={!isFullWriteoffEnabled}
                    onClick={onWriteOffMaterialFully}
                >
                    Списать полностью
                </Button>
                <Button
                    size="sm"
                    pending={isSubmittingStageLkm}
                    pendingLabel="Отражение…"
                    disabled={!isWriteoffActionsEnabled}
                    onClick={onSubmitStageLkmWriteoff}
                >
                    Отразить списание по этапу
                </Button>
            </div>
        </div>
    );
}
